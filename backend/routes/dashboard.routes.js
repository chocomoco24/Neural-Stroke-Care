  const router = require("express").Router();
  const { getDashboard, getPatientDashboard, getDoctorDashboard } = require("../controllers/dashboard.controller");
  const { protect } = require("../middleware/auth.middleware");

  router.get("/",         protect, getDashboard);
  router.get("/patient",  protect, getPatientDashboard);
  router.get("/doctor",   protect, getDoctorDashboard);

  module.exports = router;

