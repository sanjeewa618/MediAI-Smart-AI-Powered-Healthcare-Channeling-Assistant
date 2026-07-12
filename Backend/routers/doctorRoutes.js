import express from 'express';
import { 
  getDoctorDashboard, 
  updateDoctorProfile, 
  getAllDoctors,
  getDoctorSchedule,
  createDoctorSchedule,
  updateDoctorSchedule,
  deleteDoctorSchedule,
  getSpecialties,
  getDoctorAvailabilityForPatient,
  getPatientDetailsForDoctor,
  updateSessionState,
  getDoctorAnalytics
} from '../controllers/doctorController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { doctorOnly } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Public / Patient Routes
router.get('/specialties', getSpecialties);
router.get('/:id/availability', getDoctorAvailabilityForPatient);
router.get('/', getAllDoctors);

// Require login for all routes below
router.use(protect);

// Doctor Dashboard Data & Profile update (Only accessible by doctors)
router.get('/dashboard', doctorOnly, getDoctorDashboard);
router.get('/analytics', doctorOnly, getDoctorAnalytics);
router.put('/profile', doctorOnly, updateDoctorProfile);
router.get('/patient/:id', doctorOnly, getPatientDetailsForDoctor);
router.put('/session/:action', doctorOnly, updateSessionState);

// Schedule Management
router.get('/schedule', doctorOnly, getDoctorSchedule);
router.post('/schedule', doctorOnly, createDoctorSchedule);
router.put('/schedule/:id', doctorOnly, updateDoctorSchedule);
router.delete('/schedule/:id', doctorOnly, deleteDoctorSchedule);

// Get a list of all doctors (Accessible by anyone who is logged in, mainly patients searching)
router.get('/', getAllDoctors);

export default router;
