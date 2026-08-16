const { Appointment, Patient, Doctor } = require("../models");
const { serverError } = require("../utils/http");

// POST /appointments — patient sends request
const requestAppointment = async (req, res) => {
  try {
    const { doctorId } = req.body;
    if (!doctorId) return res.status(400).json({ message: "doctorId is required" });

    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // One row per patient-doctor pair (enforced by a unique index).
    const existing = await Appointment.findOne({
      where: { patientId: req.user.id, doctorId },
    });

    if (existing) {
      if (existing.status === "pending")
        return res.status(409).json({ message: "Request already sent" });
      if (existing.status === "accepted")
        return res.status(409).json({ message: "You already have a confirmed appointment with this doctor" });

      // Previously rejected — allow re-requesting by resetting the same row.
      existing.status = "pending";
      existing.appointmentDate = null;
      existing.appointmentTime = null;
      await existing.save();
      return res.status(201).json({ message: "Appointment request sent", appointment: existing });
    }

    const appt = await Appointment.create({ patientId: req.user.id, doctorId });
    res.status(201).json({ message: "Appointment request sent", appointment: appt });
  } catch (err) {
    serverError(res, err);
  }
};

// GET /appointments — doctor sees incoming requests
const getAppointmentsForDoctor = async (req, res) => {
  try {
    const appts = await Appointment.findAll({
      where: { doctorId: req.user.id },
      include: [{ model: Patient, as: "patient", attributes: ["name", "email"] }],
      order: [["createdAt", "DESC"]],
    });

    res.json(appts.map((a) => ({
      id: a.id,
      patient_name: a.patient?.name,
      patient_email: a.patient?.email,
      status: a.status,
      appointment_date: a.appointmentDate,
      appointment_time: a.appointmentTime,
      requested_at: a.createdAt,
    })));
  } catch (err) {
    serverError(res, err);
  }
};

// GET /appointments/mine — patient sees ALL their requests (pending / accepted / rejected)
const getAppointmentsForPatient = async (req, res) => {
  try {
    const appts = await Appointment.findAll({
      where: { patientId: req.user.id },
      include: [{ model: Doctor, as: "doctor", attributes: ["name", "email", "specialization"] }],
      order: [["createdAt", "DESC"]],
    });

    res.json(appts.map((a) => ({
      id: a.id,
      doctor_name: a.doctor?.name,
      doctor_email: a.doctor?.email,
      doctor_spec: a.doctor?.specialization,
      status: a.status,
      appointment_date: a.appointmentDate,
      appointment_time: a.appointmentTime,
      requested_at: a.createdAt,
    })));
  } catch (err) {
    serverError(res, err);
  }
};

// PATCH /appointments/:id — doctor accepts with date/time OR rejects
const updateAppointment = async (req, res) => {
  try {
    const { status, appointmentDate, appointmentTime } = req.body;
    if (!["accepted", "rejected"].includes(status))
      return res.status(400).json({ message: "status must be accepted or rejected" });

    if (status === "accepted" && (!appointmentDate || !appointmentTime))
      return res.status(400).json({ message: "Date and time are required when accepting" });

    const appt = await Appointment.findOne({
      where: { id: req.params.id, doctorId: req.user.id },
    });
    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    appt.status = status;
    if (status === "accepted") {
      appt.appointmentDate = appointmentDate;
      appt.appointmentTime = appointmentTime;
    } else {
      appt.appointmentDate = null;
      appt.appointmentTime = null;
    }
    await appt.save();

    res.json({ message: `Appointment ${status}`, appointment: appt });
  } catch (err) {
    serverError(res, err);
  }
};

module.exports = {
  requestAppointment,
  getAppointmentsForDoctor,
  getAppointmentsForPatient,
  updateAppointment,
};
