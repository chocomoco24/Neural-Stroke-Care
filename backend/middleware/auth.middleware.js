const jwt = require("jsonwebtoken");
const { Patient, Doctor } = require("../models");

const EXCLUDE_PASSWORD = { attributes: { exclude: ["password"] } };

/**
 * Verifies the JWT from the Authorization header.
 * Attaches `req.user` (Sequelize instance, no password) and `req.userType`.
 */
const protect = async (req, res, next) => {
  try {
    // Prefer the httpOnly cookie; fall back to a Bearer header (e.g. API clients).
    const authHeader = req.headers.authorization;
    const headerToken =
      authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    const token = req.cookies?.token || headerToken;

    if (!token) {
      return res.status(401).json({ message: "Not authorised, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user = null;
    let userType = decoded.userType;

    if (userType === "patient") {
      user = await Patient.findByPk(decoded.id, EXCLUDE_PASSWORD);
    } else if (userType === "doctor") {
      user = await Doctor.findByPk(decoded.id, EXCLUDE_PASSWORD);
    } else {
      // Legacy token fallback: search both tables
      user = await Patient.findByPk(decoded.id, EXCLUDE_PASSWORD);
      if (user) {
        userType = "patient";
      } else {
        user = await Doctor.findByPk(decoded.id, EXCLUDE_PASSWORD);
        if (user) userType = "doctor";
      }
    }

    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    req.userType = userType;
    req.user.userType = userType; // backward compat for controllers

    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};

/**
 * Role-based access control.
 * Usage: authorise("doctor")  or  authorise("patient", "doctor")
 */
const authorise = (...roles) => (req, res, next) => {
  if (!roles.includes(req.userType)) {
    return res.status(403).json({
      message: `Access denied. Required role: ${roles.join(" or ")}`,
    });
  }
  next();
};

module.exports = { protect, authorise };
