const router = require("express").Router();
const { body } = require("express-validator");
const { predict, getHistory } = require("../controllers/prediction.controller");
const { protect, authorise } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate");

const predictRules = [
  body("age").isInt({ min: 0, max: 120 }).withMessage("age must be between 0 and 120"),
  body("hypertension").isInt({ min: 0, max: 1 }).withMessage("hypertension must be 0 or 1"),
  body("heart_disease").isInt({ min: 0, max: 1 }).withMessage("heart_disease must be 0 or 1"),
  body("avg_glucose_level").isFloat({ min: 0 }).withMessage("avg_glucose_level must be a positive number"),
  body("bmi").isFloat({ min: 0 }).withMessage("bmi must be a positive number"),
  body("gender").trim().notEmpty(),
  body("ever_married").trim().notEmpty(),
  body("work_type").trim().notEmpty(),
  body("residence_type").trim().notEmpty(),
  body("smoking_status").trim().notEmpty(),
];

// Only patients may submit predictions
router.post("/", protect, authorise("patient"), predictRules, validate, predict);

// A patient can view their own history
router.get("/history", protect, authorise("patient"), getHistory);

module.exports = router;
