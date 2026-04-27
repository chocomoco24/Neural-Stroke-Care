const router = require("express").Router();
const { predict, getHistory } = require("../controllers/prediction.controller");
const { protect, authorise } = require("../middleware/auth.middleware");

// Only patients may submit predictions
router.post("/", protect, authorise("patient"), predict);

// Any authenticated user can view their own history
router.get("/history", protect, getHistory);

module.exports = router;
