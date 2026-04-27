const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Verifies the JWT from the Authorization header.
 * Attaches `req.user` (Mongoose document, no password).
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorised, no token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) return res.status(401).json({ message: "User not found" });

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
  if (!roles.includes(req.user.userType)) {
    return res.status(403).json({
      message: `Access denied. Required role: ${roles.join(" or ")}`,
    });
  }
  next();
};

module.exports = { protect, authorise };
