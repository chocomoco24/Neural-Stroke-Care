const jwt = require("jsonwebtoken");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");

/**
 * Verifies the JWT from the Authorization header.
 * Attaches `req.user` (Mongoose document, no password) and `req.userType`.
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorised, no token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Support both old tokens (no userType) and new tokens (with userType)
    let user = null;
    let userType = decoded.userType;

    if (userType === "patient") {
      user = await Patient.findById(decoded.id).select("-password");
    } else if (userType === "doctor") {
      user = await Doctor.findById(decoded.id).select("-password");
    } else {
      // Legacy token fallback: search both collections
      user = await Patient.findById(decoded.id).select("-password");
      if (user) {
        userType = "patient";
      } else {
        user = await Doctor.findById(decoded.id).select("-password");
        if (user) userType = "doctor";
      }
    }

    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    req.userType = userType;
    // Attach userType onto the user object for backward compat with controllers
    req.user.userType = userType;

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
