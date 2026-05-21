const Doctor = require("../models/Doctor");
const PatientRecord = require("../models/PatientRecord");


function formatUser(u, userType = "Doctor") {
  if (!u) return null;
  return {
    id:             u._id,
    name:           u.name,
    email:          u.email,
    user_type:      userType,
    specialization: u.specialization,
    is_available:   u.isAvailable,
    available_from: u.availableFrom,
    available_to:   u.availableTo,
  };
}

// GET /doctors
const listDoctors = async (req, res) => {
  try {
    const { availability, specialization } = req.query;
    const filter = {};
    if (availability === "online")  filter.isAvailable = true;
    if (availability === "offline") filter.isAvailable = false;
    if (specialization) filter.specialization = { $regex: specialization, $options: "i" };

    const doctors = await Doctor
      .find(filter)
      .select("-password")
      .sort({ isAvailable: -1, name: 1 });

    res.json(doctors.map(formatUser));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /doctors/specializations
const getSpecializations = async (req, res) => {
  try {
    const specs = await Doctor.distinct("specialization", {
      specialization: { $ne: null },
    });
    res.json(specs.filter(Boolean).sort());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /doctors/toggle-availability  (also handles PATCH /doctors/availability)
const toggleAvailability = async (req, res) => {
  try {
    const { specialization, available_from, available_to } = req.body;

    const update = { isAvailable: !req.Doctor.isAvailable };
    if (specialization)  update.specialization = specialization.trim() || "General Physician";
    if (available_from)  update.availableFrom  = available_from;
    if (available_to)    update.availableTo    = available_to;

    const updated = await Doctor
      .findByIdAndUpdate(req.Doctor._id, update, { new: true })
      .select("-password");

    res.json({
      user:    formatUser(updated, "doctor"),
      message: `Now ${update.isAvailable ? "Online" : "Offline"}`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /doctors/patients  (doctor only)
const listPatients = async (req, res) => {
  try {
    const records = await PatientRecord
      .find()
      .populate({ path: "patientId", select: "name email" })
      .sort({ createdAt: -1 });

    res.json({ records: records.filter((r) => r.patientId !== null) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { listDoctors, getSpecializations, toggleAvailability, listPatients };
