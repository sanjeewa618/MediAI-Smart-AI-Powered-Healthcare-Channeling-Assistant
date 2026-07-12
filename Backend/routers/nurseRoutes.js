import express from 'express';
import { getTodayAppointments, updateAppointmentStatus, createMedicalRecord, getAllNurses, getLabDepartments, updateNurseProfile, uploadNurseAvatar, getNurseStats } from '../controllers/nurseController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { nurseOnly } from '../middlewares/roleMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Public route
router.get('/departments', getLabDepartments);

// Require login for all routes below
router.use(protect);

// Get all nurses (Accessible by patients searching for labs/nurses)
router.get('/', getAllNurses);

// Require Nurse role for the routes below
router.use(nurseOnly);

// Profile management
router.put('/profile', updateNurseProfile);
router.get('/profile/stats', getNurseStats);
router.post('/profile/upload-avatar', upload.single('avatar'), uploadNurseAvatar);

// Appointment Management (Queue tracking)
router.get('/appointments/today', getTodayAppointments);
router.put('/appointments/:id/status', updateAppointmentStatus);

// Medical Records (Pre-consultation notes/vitals)
router.post('/medical-records', createMedicalRecord);

export default router;
