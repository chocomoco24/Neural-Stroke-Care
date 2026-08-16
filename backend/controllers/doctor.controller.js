const { Op } = require("sequelize");
const { Doctor } = require("../models");
const { formatUser } = require("../utils/format");
const { serverError } = require("../utils/http");

// GET /doctors
const listDoctors = async (req, res) => {
  try {
    const { availability, specialization } = req.query;
    const where = {};
    if (availability === "online") where.isAvailable = true;
    if (availability === "offline") where.isAvailable = false;
    if (specialization) where.specialization = { [Op.like]: `%${specialization}%` };

    const doctors = await Doctor.findAll({
      where,
      attributes: { exclude: ["password"] },
      order: [["isAvailable", "DESC"], ["name", "ASC"]],
    });

    res.json(doctors.map((d) => formatUser(d, "doctor")));
  } catch (err) {
    serverError(res, err);
  }
};

// GET /doctors/specializations
const getSpecializations = async (req, res) => {
  try {
    const rows = await Doctor.findAll({
      attributes: [[Doctor.sequelize.fn("DISTINCT", Doctor.sequelize.col("specialization")), "specialization"]],
      where: { specialization: { [Op.ne]: null } },
      raw: true,
    });
    const specs = rows.map((r) => r.specialization).filter(Boolean).sort();
    res.json(specs);
  } catch (err) {
    serverError(res, err);
  }
};

// POST /doctors/toggle-availability — flip Online/Offline ONLY
const toggleAvailability = async (req, res) => {
  try {
    req.user.isAvailable = !req.user.isAvailable;
    await req.user.save();

    res.json({
      user: formatUser(req.user, "doctor"),
      message: `Now ${req.user.isAvailable ? "Online" : "Offline"}`,
    });
  } catch (err) {
    serverError(res, err);
  }
};

// PATCH /doctors/profile — update specialization / hours WITHOUT changing availability
const updateProfile = async (req, res) => {
  try {
    const { specialization, available_from, available_to } = req.body;

    if (specialization !== undefined)
      req.user.specialization = specialization.trim() || "General Physician";
    if (available_from !== undefined) req.user.availableFrom = available_from || null;
    if (available_to !== undefined) req.user.availableTo = available_to || null;

    await req.user.save();

    res.json({
      user: formatUser(req.user, "doctor"),
      message: "Profile updated",
    });
  } catch (err) {
    serverError(res, err);
  }
};

module.exports = { listDoctors, getSpecializations, toggleAvailability, updateProfile };
