const axios = require("axios");
const PatientRecord = require("../models/PatientRecord");

const GENDER_MAP   = { male: "Male", female: "Female", other: "Other" };
const MARRIED_MAP  = { yes: "Yes", no: "No" };
const WORK_MAP     = {
  "private":        "Private",
  "self-employed":  "Self-employed",
  "government job": "Govt_job",
  "govt_job":       "Govt_job",
  "children":       "children",
  "never worked":   "Never_worked",
  "never_worked":   "Never_worked",
};
const RESIDENCE_MAP = { urban: "Urban", rural: "Rural" };
const SMOKING_MAP   = {
  "never smoked":    "never smoked",
  "formerly smoked": "formerly smoked",
  "smokes":          "smokes",
  "unknown":         "Unknown",
};


function formatRecord(r) {
  if (!r) return null;
  return {
    id:                r._id,
    prediction_result: r.predictionResult,
    risk_probability:  r.riskProbability,
    age:               r.age,
    bmi:               r.bmi,
    avg_glucose_level: r.avgGlucoseLevel,
    hypertension:      r.hypertension,
    heart_disease:     r.heartDisease,
    smoking_status:    r.smokingStatus,
    gender:            r.gender,
    ever_married:      r.everMarried,
    work_type:         r.workType,
    residence_type:    r.residenceType,
    created_at:        r.createdAt,   // ← this fixes "Invalid Date"
  };
}

// POST /predict
const predict = async (req, res) => {
  try {
    const {
      gender, age, hypertension, heart_disease,
      ever_married, work_type, residence_type,
      avg_glucose_level, bmi, smoking_status,
    } = req.body;

    const mlPayload = {
      gender:            GENDER_MAP[gender?.toLowerCase()] || gender,
      age:               parseInt(age),
      hypertension:      parseInt(hypertension),
      heart_disease:     parseInt(heart_disease),
      ever_married:      MARRIED_MAP[ever_married?.toLowerCase()] || ever_married,
      work_type:         WORK_MAP[work_type?.toLowerCase()] || work_type,
      Residence_type:    RESIDENCE_MAP[residence_type?.toLowerCase()] || residence_type,
      avg_glucose_level: parseFloat(avg_glucose_level),
      bmi:               parseFloat(bmi),
      smoking_status:    SMOKING_MAP[smoking_status?.toLowerCase()] || smoking_status,
    };

    const mlResponse = await axios.post(
      `${process.env.ML_API_URL}/predict`,
      mlPayload,
      { timeout: 60000 }
    );

    const { result, probability } = mlResponse.data;

    const record = await PatientRecord.create({
      patientId:        req.user._id,
      predictionResult: result,
      riskProbability:  probability,
      gender:           mlPayload.gender,
      age:              mlPayload.age,
      hypertension:     mlPayload.hypertension,
      heartDisease:     mlPayload.heart_disease,
      everMarried:      mlPayload.ever_married,
      workType:         mlPayload.work_type,
      residenceType:    mlPayload.Residence_type,
      avgGlucoseLevel:  mlPayload.avg_glucose_level,
      bmi:              mlPayload.bmi,
      smokingStatus:    mlPayload.smoking_status,
    });

    res.status(201).json({ result, probability, record: formatRecord(record) });

  } catch (err) {
    if (err.response) {
      console.error("ML API error:", err.response.data);
      return res.status(502).json({ message: "ML service error", detail: err.response.data });
    }
    console.error("predict error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// GET /predict/history

const getHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 0;
    let query = PatientRecord
      .find({ patientId: req.user._id })
      .sort({ createdAt: -1 });
    if (limit > 0) query = query.limit(limit);

    const records = await query;

    // Return a plain array with snake_case field names
    res.json(records.map(formatRecord));

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { predict, getHistory };
