const express = require('express');
const router = express.Router();

const {
  listMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
  getPatientStats
} = require('../controllers/medicalRecordController');

const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get(
  '/patient/stats',
  authorize('patient', 'doctor', 'nurse', 'lab', 'admin'),
  getPatientStats
);

router.get(
  '/',
  authorize('patient', 'doctor', 'nurse', 'lab', 'admin'),
  listMedicalRecords
);

router.get(
  '/:id',
  authorize('patient', 'doctor', 'nurse', 'lab', 'admin'),
  getMedicalRecordById
);

router.post(
  '/',
  authorize('patient', 'doctor', 'nurse', 'lab', 'admin'),
  createMedicalRecord
);

router.patch(
  '/:id',
  authorize('patient', 'doctor', 'nurse', 'lab', 'admin'),
  updateMedicalRecord
);

router.delete(
  '/:id',
  authorize('patient', 'doctor', 'nurse', 'lab', 'admin'),
  deleteMedicalRecord
);

module.exports = router;
