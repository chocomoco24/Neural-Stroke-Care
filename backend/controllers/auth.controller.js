const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });


function formatUser(u) {
  const obj = u.toJSON ? u.toJSON() : { ...u };
  return {
    ...obj,
    user_type:      u.userType,
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

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: "Email already registered" });

    const userData = { name, email, password, userType };
    if (userType === "doctor") {
      userData.specialization = specialization || "General Physician";
      userData.isAvailable    = isAvailable || is_available || false;
      userData.availableFrom  = availableFrom || available_from || null;
      userData.availableTo    = availableTo   || available_to   || null;
    }

    const user = await User.create(userData);
    const token = signToken(user._id);

    res.status(201).json({ token, user: formatUser(user) });
  } catch (err) {
    console.error("signup error:", err);
    res.status(500).json({ message: err.message });
  }
};

// POST /auth/login
const login = async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    const user = await User.findOne({ email: email.toLowerCase(), userType });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken(user._id);
    res.json({ token, user: formatUser(user) });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET /auth/me
const getMe = async (req, res) => {
  res.json({ user: formatUser(req.user) });
};

module.exports = { signup, login, getMe };
