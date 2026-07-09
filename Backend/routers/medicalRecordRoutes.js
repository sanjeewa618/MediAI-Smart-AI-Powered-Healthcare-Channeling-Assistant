import express from 'express';
import {
  listMedicalRecords, getMedicalRecordById, createMedicalRecord,
  updateMedicalRecord, deleteMedicalRecord, getPatientStats
} from '../controllers/medicalRecordController.js';

import { protect } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/patient/stats', authorizeRoles('patient', 'doctor', 'nurse', 'lab', 'admin'), getPatientStats);
router.get('/', authorizeRoles('patient', 'doctor', 'nurse', 'lab', 'admin'), listMedicalRecords);
router.get('/:id', authorizeRoles('patient', 'doctor', 'nurse', 'lab', 'admin'), getMedicalRecordById);
router.post('/', authorizeRoles('patient', 'doctor', 'nurse', 'lab', 'admin'), createMedicalRecord);
router.patch('/:id', authorizeRoles('patient', 'doctor', 'nurse', 'lab', 'admin'), updateMedicalRecord);
router.delete('/:id', authorizeRoles('patient', 'doctor', 'nurse', 'lab', 'admin'), deleteMedicalRecord);

export default router;
