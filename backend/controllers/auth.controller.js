const jwt = require("jsonwebtoken");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");

const signToken = (id, userType) =>
  jwt.sign({ id, userType }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

function formatUser(u, userType) {
  const obj = u.toJSON ? u.toJSON() : { ...u };
  return {
    ...obj,
    user_type:      userType,
    is_available:   u.isAvailable,
    available_from: u.availableFrom,
    available_to:   u.availableTo,
  };
}

// POST /auth/signup
const signup = async (req, res) => {
  try {
    const {
      name, email, password, userType,
      specialization, isAvailable, is_available,
      availableFrom, available_from,
      availableTo, available_to,
    } = req.body;

    const validTypes = ["patient", "doctor"];
    if (!validTypes.includes(userType)) {
      return res.status(400).json({ message: "Invalid account type" });
    }

    if (userType === "patient") {
      const exists = await Patient.findOne({ email: email.toLowerCase() });
      if (exists) return res.status(409).json({ message: "Email already registered" });

      const patient = await Patient.create({ name, email, password });
      const token = signToken(patient._id, "patient");
      return res.status(201).json({ token, user: formatUser(patient, "patient") });
    }

    // doctor
    const exists = await Doctor.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: "Email already registered" });

    const doctor = await Doctor.create({
      name, email, password,
      specialization: specialization || "General Physician",
      isAvailable:    isAvailable || is_available || false,
      availableFrom:  availableFrom || available_from || null,
      availableTo:    availableTo   || available_to   || null,
    });
    const token = signToken(doctor._id, "doctor");
    return res.status(201).json({ token, user: formatUser(doctor, "doctor") });

  } catch (err) {
    console.error("signup error:", err);
    res.status(500).json({ message: err.message });
  }
};

// POST /auth/login
const login = async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    const validTypes = ["patient", "doctor"];
    if (!validTypes.includes(userType)) {
      return res.status(400).json({ message: "Invalid account type" });
    }

    const Model = userType === "patient" ? Patient : Doctor;
    const user = await Model.findOne({ email: email.toLowerCase() });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken(user._id, userType);
    res.json({ token, user: formatUser(user, userType) });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET /auth/me
const getMe = async (req, res) => {
  res.json({ user: formatUser(req.user, req.userType) });
};

module.exports = { signup, login, getMe };
