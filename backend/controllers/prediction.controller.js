const axios = require("axios");
const { PatientRecord } = require("../models");
const { formatRecord } = require("../utils/format");
const { serverError } = require("../utils/http");

// Canonicalise categorical values to the exact casing the model was trained on.
// (The ML service also normalises, but we store the canonical form so records
//  are consistent regardless of what casing the client sent.)
const GENDER_MAP = { male: "Male", female: "Female", other: "Other" };
const MARRIED_MAP = { yes: "Yes", no: "No" };
const WORK_MAP = {
  "private": "Private",
  "self-employed": "Self-employed",
  "government job": "Govt_job",
  "govt_job": "Govt_job",
  "children": "children",
  "never worked": "Never_worked",
  "never_worked": "Never_worked",
};
const RESIDENCE_MAP = { urban: "Urban", rural: "Rural" };
const SMOKING_MAP = {
  "never smoked": "never smoked",
  "formerly smoked": "formerly smoked",
  "smokes": "smokes",
  "unknown": "Unknown",
};

const map = (table, value) =>
  value == null ? value : table[String(value).toLowerCase()] || value;

// POST /predict
const predict = async (req, res) => {
  try {
    const {
      gender, age, hypertension, heart_disease,
      ever_married, work_type, residence_type,
      avg_glucose_level, bmi, smoking_status,
    } = req.body;

    // Numeric coercion with guards — never forward NaN to the ML service.
    const ageNum = parseInt(age, 10);
    const glucoseNum = parseFloat(avg_glucose_level);
    const bmiNum = parseFloat(bmi);
    const htn = parseInt(hypertension, 10);
    const heart = parseInt(heart_disease, 10);

    if ([ageNum, glucoseNum, bmiNum, htn, heart].some((n) => Number.isNaN(n))) {
      return res.status(422).json({ message: "age, bmi, glucose, hypertension and heart_disease must be numeric" });
    }

    const mlPayload = {
      gender: map(GENDER_MAP, gender),
      age: ageNum,
      hypertension: htn,
      heart_disease: heart,
      ever_married: map(MARRIED_MAP, ever_married),
      work_type: map(WORK_MAP, work_type),
      Residence_type: map(RESIDENCE_MAP, residence_type),
      avg_glucose_level: glucoseNum,
      bmi: bmiNum,
      smoking_status: map(SMOKING_MAP, smoking_status),
    };

    const mlResponse = await axios.post(
      `${process.env.ML_API_URL}/predict`,
      mlPayload,
      { timeout: 60000 }
    );

    const { result, probability } = mlResponse.data;

    const record = await PatientRecord.create({
      patientId: req.user.id,
      predictionResult: result,
      riskProbability: probability,
      gender: mlPayload.gender,
      age: mlPayload.age,
      hypertension: mlPayload.hypertension,
      heartDisease: mlPayload.heart_disease,
      everMarried: mlPayload.ever_married,
      workType: mlPayload.work_type,
      residenceType: mlPayload.Residence_type,
      avgGlucoseLevel: mlPayload.avg_glucose_level,
      bmi: mlPayload.bmi,
      smokingStatus: mlPayload.smoking_status,
    });

    res.status(201).json({ result, probability, record: formatRecord(record) });
  } catch (err) {
    if (err.response) {
      console.error("ML API error:", err.response.data);
      return res.status(502).json({ message: "ML service error", detail: err.response.data });
    }
    serverError(res, err);
  }
};

// GET /predict/history
const getHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 0;
    const records = await PatientRecord.findAll({
      where: { patientId: req.user.id },
      order: [["createdAt", "DESC"]],
      ...(limit > 0 ? { limit } : {}),
    });

    res.json(records.map(formatRecord));
  } catch (err) {
    serverError(res, err);
  }
};

module.exports = { predict, getHistory };
