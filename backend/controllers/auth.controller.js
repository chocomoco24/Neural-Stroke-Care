const jwt = require("jsonwebtoken");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");

// Now includes role in the token so middleware knows which collection to query
const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

function formatUser(u, userType) {
  const obj = u.toJSON ? u.toJSON() : { ...u };
  return {
    ...obj,
    user_type:      userType,
    is_available:   u.isAvailable   ?? undefined,
    available_from: u.availableFrom ?? undefined,
    available_to:   u.availableTo   ?? undefined,
  };
}

// POST /auth/signup
const signup = async (req, res) => {
  try {
    const { name, email, password, userType, specialization, isAvailable, availableFrom, availableTo } = req.body;

    if (userType === "patient") {
      const exists = await Patient.findOne({ email: email.toLowerCase() });
      if (exists) return res.status(409).json({ message: "Email already registered" });

      const patient = await Patient.create({ name, email, password });
      const token = signToken(patient._id, "patient");
      return res.status(201).json({ token, user: formatUser(patient, "patient") });
    }

    if (userType === "doctor") {
      const exists = await Doctor.findOne({ email: email.toLowerCase() });
      if (exists) return res.status(409).json({ message: "Email already registered" });

      const doctor = await Doctor.create({
        name, email, password,
        specialization: specialization || "General Physician",
        isAvailable:    isAvailable    || false,
        availableFrom:  availableFrom  || null,
        availableTo:    availableTo    || null,
      });
      const token = signToken(doctor._id, "doctor");
      return res.status(201).json({ token, user: formatUser(doctor, "doctor") });
    }

    return res.status(400).json({ message: "Invalid account type" });
  } catch (err) {
    console.error("signup error:", err);
    res.status(500).json({ message: err.message });
  }
};

// POST /auth/login
const login = async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    const Model = userType === "doctor" ? Doctor : Patient;
    const user = await Model.findOne({ email: email.toLowerCase() });

    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: "Invalid email or password" });

    const token = signToken(user._id, userType);
    res.json({ token, user: formatUser(user, userType) });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET /auth/me
const getMe = async (req, res) => {
  res.json({ user: formatUser(req.user, req.user.userType) });
};

module.exports = { signup, login, getMe };