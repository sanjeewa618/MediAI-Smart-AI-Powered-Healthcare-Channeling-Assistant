import express from 'express';
import { getDashboardData, updateProfile } from '../controllers/patientController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { patientOnly } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// All routes in this file require the user to be logged in AND be a patient
router.use(protect);
router.use(patientOnly);

router.get('/dashboard', getDashboardData);
router.put('/profile', updateProfile);

export default router;
