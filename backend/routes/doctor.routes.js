const router = require("express").Router();
const {
  listDoctors,
  getSpecializations,
  toggleAvailability,
  listPatients,
} = require("../controllers/doctor.controller");
const { protect, authorise } = require("../middleware/auth.middleware");

router.get("/",                     protect, listDoctors);
router.get("/specializations",      protect, getSpecializations);
router.get("/patients",             protect, authorise("doctor"), listPatients);
router.post("/toggle-availability", protect, authorise("doctor"), toggleAvailability);
router.patch("/availability",       protect, authorise("doctor"), toggleAvailability);

module.exports = router;
