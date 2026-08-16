const jwt = require("jsonwebtoken");
const { Patient, Doctor } = require("../models");
const { serverError } = require("../utils/http");
const { setAuthCookie, clearAuthCookie } = require("../utils/cookie");

const signToken = (id, userType) =>
  jwt.sign({ id, userType }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

function formatUser(u, userType) {
  const obj = u.toJSON ? u.toJSON() : { ...u };
  return {
    ...obj,
    user_type: userType,
    is_available: u.isAvailable,
    available_from: u.availableFrom,
    available_to: u.availableTo,
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

    const normalisedEmail = email.toLowerCase().trim();

    if (userType === "patient") {
      const exists = await Patient.findOne({ where: { email: normalisedEmail } });
      if (exists) return res.status(409).json({ message: "Email already registered" });

      const patient = await Patient.create({ name, email: normalisedEmail, password });
      setAuthCookie(res, signToken(patient.id, "patient"));
      return res.status(201).json({ user: formatUser(patient, "patient") });
    }

    // doctor
    const exists = await Doctor.findOne({ where: { email: normalisedEmail } });
    if (exists) return res.status(409).json({ message: "Email already registered" });

    const doctor = await Doctor.create({
      name,
      email: normalisedEmail,
      password,
      specialization: specialization || "General Physician",
      isAvailable: isAvailable || is_available || false,
      availableFrom: availableFrom || available_from || null,
      availableTo: availableTo || available_to || null,
    });
    setAuthCookie(res, signToken(doctor.id, "doctor"));
    return res.status(201).json({ user: formatUser(doctor, "doctor") });
  } catch (err) {
    serverError(res, err);
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
    const user = await Model.findOne({ where: { email: email.toLowerCase().trim() } });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    setAuthCookie(res, signToken(user.id, userType));
    res.json({ user: formatUser(user, userType) });
  } catch (err) {
    serverError(res, err);
  }
};

// GET /auth/me
const getMe = async (req, res) => {
  res.json({ user: formatUser(req.user, req.userType) });
};

// POST /auth/logout — clear the auth cookie
const logout = async (_req, res) => {
  clearAuthCookie(res);
  res.json({ message: "Logged out" });
};

module.exports = { signup, login, getMe, logout };
