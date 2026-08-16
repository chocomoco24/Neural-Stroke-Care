const sequelize = require("../config/database");
const Patient = require("./Patient");
const Doctor = require("./Doctor");
const PatientRecord = require("./PatientRecord");
const Appointment = require("./Appointment");

// ── Associations ────────────────────────────────────────────────
// A patient has many prediction records
Patient.hasMany(PatientRecord, { foreignKey: "patientId", as: "records", onDelete: "CASCADE" });
PatientRecord.belongsTo(Patient, { foreignKey: "patientId", as: "patient" });

// Appointments link a patient and a doctor
Patient.hasMany(Appointment, { foreignKey: "patientId", as: "appointments", onDelete: "CASCADE" });
Doctor.hasMany(Appointment, { foreignKey: "doctorId", as: "appointments", onDelete: "CASCADE" });
Appointment.belongsTo(Patient, { foreignKey: "patientId", as: "patient" });
Appointment.belongsTo(Doctor, { foreignKey: "doctorId", as: "doctor" });

module.exports = {
  sequelize,
  Patient,
  Doctor,
  PatientRecord,
  Appointment,
};
