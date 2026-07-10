import express from 'express';
import { getDashboardData, updateProfile, uploadInsuranceDocument, getPatientStats, getPatientReports, uploadPatientReport } from '../controllers/patientController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { patientOnly } from '../middlewares/roleMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// All routes in this file require the user to be logged in AND be a patient
router.use(protect);
router.use(patientOnly);

router.get('/dashboard', getDashboardData);
router.get('/stats', getPatientStats);
router.put('/profile', updateProfile);
router.post('/upload-insurance', upload.single('insuranceCard'), uploadInsuranceDocument);
router.get('/reports', getPatientReports);
router.post('/reports/upload', upload.single('reportFile'), uploadPatientReport);

export default router;
