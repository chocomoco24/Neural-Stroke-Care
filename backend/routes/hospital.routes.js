const router = require("express").Router();
const { nearbyHospitals } = require("../controllers/hospital.controller");

router.get("/", nearbyHospitals);

module.exports = router;
