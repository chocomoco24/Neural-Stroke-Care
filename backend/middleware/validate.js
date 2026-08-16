const { validationResult } = require("express-validator");

/**
 * Runs after a chain of express-validator rules. If any failed,
 * responds 422 with the list of errors; otherwise passes through.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = { validate };
