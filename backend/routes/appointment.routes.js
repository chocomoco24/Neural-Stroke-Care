const router = require('express').Router();
const {
  requestAppointment,
  getAppointmentsForDoctor,
  getAppointmentsForPatient,
  updateAppointment,
} = require('../controllers/appointment.controller');
const { protect, authorise } = require('../middleware/auth.middleware');

router.post('/',        protect, authorise('patient'), requestAppointment);
router.get('/',         protect, authorise('doctor'),  getAppointmentsForDoctor);
router.get('/mine',     protect, authorise('patient'), getAppointmentsForPatient);
router.patch('/:id',    protect, authorise('doctor'),  updateAppointment);

module.exports = router;