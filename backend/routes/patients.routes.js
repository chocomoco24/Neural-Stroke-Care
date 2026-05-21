const router = require("express").Router();
const { protect, authorise } = require("../middleware/auth.middleware");
const PatientRecord = require("../models/PatientRecord");

// GET /patients  — doctor only: all patient records
router.get("/", protect, authorise("doctor"), async (req, res) => {
  try {
    const records = await PatientRecord
      .find()
      .populate({ path: "patientId", match: { userType: "patient" }, select: "name email" })
      .sort({ createdAt: -1 });

    const formatted = records
      .filter((r) => r.patientId !== null)
      .map((r) => ({
        id:                r._id,
        patient_name:      r.patientId?.name  || "—",
        patient_email:     r.patientId?.email || "—",
        prediction_result: r.predictionResult,
        risk_probability:  r.riskProbability,
        age:               r.age,
        bmi:               r.bmi,
        avg_glucose_level: r.avgGlucoseLevel,
        hypertension:      r.hypertension,
        heart_disease:     r.heartDisease,
        smoking_status:    r.smokingStatus,
        created_at:        r.createdAt,
      }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
