import express from 'express';
import { getDoctorDashboard, updateDoctorProfile, getAllDoctors } from '../controllers/doctorController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { doctorOnly } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Require login for all routes
router.use(protect);

// Doctor Dashboard Data & Profile update (Only accessible by doctors)
router.get('/dashboard', doctorOnly, getDoctorDashboard);
router.put('/profile', doctorOnly, updateDoctorProfile);

// Get a list of all doctors (Accessible by anyone who is logged in, mainly patients searching)
router.get('/', getAllDoctors);

export default router;
