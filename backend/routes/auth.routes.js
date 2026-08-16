const router = require("express").Router();
const { body } = require("express-validator");
const { signup, login, getMe, logout } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate");

const signupRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("userType").isIn(["patient", "doctor"]).withMessage("Invalid account type"),
];

const loginRules = [
  body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  body("userType").isIn(["patient", "doctor"]).withMessage("Invalid account type"),
];

router.post("/signup", signupRules, validate, signup);
router.post("/login", loginRules, validate, login);
router.post("/logout", logout);
router.get("/me", protect, getMe);

module.exports = router;
