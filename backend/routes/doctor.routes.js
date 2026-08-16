const router = require("express").Router();
const {
  listDoctors,
  getSpecializations,
  toggleAvailability,
  updateProfile,
} = require("../controllers/doctor.controller");
const { protect, authorise } = require("../middleware/auth.middleware");

router.get("/", protect, listDoctors);
router.get("/specializations", protect, getSpecializations);
router.post("/toggle-availability", protect, authorise("doctor"), toggleAvailability);
router.patch("/profile", protect, authorise("doctor"), updateProfile);

module.exports = router;
