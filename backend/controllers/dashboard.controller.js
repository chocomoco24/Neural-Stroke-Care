const { PatientRecord, Doctor, Patient } = require("../models");
const { formatRecord, formatUser } = require("../utils/format");
const { serverError } = require("../utils/http");

// GET /dashboard  — auto-redirects by role
const getDashboard = async (req, res) => {
  if (req.userType === "doctor") return getDoctorDashboard(req, res);
  return getPatientDashboard(req, res);
};

// GET /dashboard/patient
const getPatientDashboard = async (req, res) => {
  try {
    const [latestRecord, history, doctors] = await Promise.all([
      PatientRecord.findOne({
        where: { patientId: req.user.id },
        order: [["createdAt", "DESC"]],
      }),
      PatientRecord.findAll({
        where: { patientId: req.user.id },
        order: [["createdAt", "DESC"]],
        limit: 10,
      }),
      Doctor.findAll({
        attributes: { exclude: ["password"] },
        order: [["isAvailable", "DESC"], ["name", "ASC"]],
      }),
    ]);

    res.json({
      user: formatUser(req.user, "patient"),
      latest_test: formatRecord(latestRecord),
      history: history.map(formatRecord),
      doctors: doctors.map((d) => formatUser(d, "doctor")),
    });
  } catch (err) {
    serverError(res, err);
  }
};

// GET /dashboard/doctor
const getDoctorDashboard = async (req, res) => {
  try {
    const likelyRecords = await PatientRecord.findAll({
      where: { predictionResult: "Likely" },
      include: [{ model: Patient, as: "patient", attributes: ["name", "email"] }],
      order: [["createdAt", "DESC"]],
    });

    const likely_patients = likelyRecords.map((r) => ({
      ...formatRecord(r),
      patient_name: r.patient?.name || "—",
      patient_email: r.patient?.email || "—",
    }));

    res.json({
      user: formatUser(req.user, "doctor"),
      likely_patients,
    });
  } catch (err) {
    serverError(res, err);
  }
};

module.exports = { getDashboard, getPatientDashboard, getDoctorDashboard };
