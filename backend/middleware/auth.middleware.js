const jwt = require("jsonwebtoken");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res.status(401).json({ message: "Not authorised, no token" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded.role tells us which collection to query
    if (decoded.role === "doctor") {
      req.user = await Doctor.findById(decoded.id).select("-password");
      if (req.user) req.user.userType = "doctor";   // keep userType so authorise() still works
    } else {
      req.user = await Patient.findById(decoded.id).select("-password");
      if (req.user) req.user.userType = "patient";
    }

    if (!req.user) return res.status(401).json({ message: "User not found" });
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};

const authorise = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.userType))
    return res.status(403).json({ message: `Access denied. Required role: ${roles.join(" or ")}` });
  next();
};

module.exports = { protect, authorise };