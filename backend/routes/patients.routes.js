const router = require("express").Router();
const { protect, authorise } = require("../middleware/auth.middleware");
const { PatientRecord, Patient } = require("../models");
const { serverError } = require("../utils/http");

// GET /patients — doctor only: all patient prediction records
router.get("/", protect, authorise("doctor"), async (req, res) => {
  try {
    const records = await PatientRecord.findAll({
      include: [{ model: Patient, as: "patient", attributes: ["name", "email"] }],
      order: [["createdAt", "DESC"]],
    });

    const formatted = records
      .filter((r) => r.patient !== null)
      .map((r) => ({
        id: r.id,
        patient_name: r.patient?.name || "—",
        patient_email: r.patient?.email || "—",
        prediction_result: r.predictionResult,
        risk_probability: r.riskProbability,
        age: r.age,
        bmi: r.bmi,
        avg_glucose_level: r.avgGlucoseLevel,
        hypertension: r.hypertension,
        heart_disease: r.heartDisease,
        smoking_status: r.smokingStatus,
        created_at: r.createdAt,
      }));

    res.json(formatted);
  } catch (err) {
    serverError(res, err);
  }
});

module.exports = router;
