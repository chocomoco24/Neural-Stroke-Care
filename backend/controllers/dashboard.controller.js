const PatientRecord = require("../models/PatientRecord");
const User = require("../models/User");

// Converts MongoDB record → shape the old UI expects
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
    created_at:        r.createdAt,
  };
}

// Converts MongoDB user → shape the old UI expects
function formatUser(u) {
  if (!u) return null;
  return {
    id:             u._id,
    name:           u.name,
    email:          u.email,
    user_type:      u.userType,
    specialization: u.specialization,
    is_available:   u.isAvailable,
    available_from: u.availableFrom,
    available_to:   u.availableTo,
  };
}

// GET /dashboard  — auto-redirects by role
const getDashboard = async (req, res) => {
  if (req.user.userType === "doctor") return getDoctorDashboard(req, res);
  return getPatientDashboard(req, res);
};

// GET /dashboard/patient
const getPatientDashboard = async (req, res) => {
  try {
    const latestRecord = await PatientRecord
      .findOne({ patientId: req.user._id })
      .sort({ createdAt: -1 });

    const history = await PatientRecord
      .find({ patientId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    const doctors = await User
      .find({ userType: "doctor" })
      .select("-password")
      .sort({ isAvailable: -1, name: 1 });

    res.json({
      user:        formatUser(req.user),
      latest_test: formatRecord(latestRecord),
      history:     history.map(formatRecord),
      doctors:     doctors.map(formatUser),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /dashboard/doctor
const getDoctorDashboard = async (req, res) => {
  try {
    const likelyRecords = await PatientRecord
      .find({ predictionResult: "Likely" })
      .populate({ path: "patientId", select: "name email" })
      .sort({ createdAt: -1 });

    const likely_patients = likelyRecords.map((r) => ({
      ...formatRecord(r),
      patient_name:  r.patientId?.name  || "—",
      patient_email: r.patientId?.email || "—",
    }));

    res.json({
      user:            formatUser(req.user),
      likely_patients,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getDashboard, getPatientDashboard, getDoctorDashboard };
