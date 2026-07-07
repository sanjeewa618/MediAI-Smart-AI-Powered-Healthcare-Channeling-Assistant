import express from 'express';
import { createAppointment, getMyAppointments, updateAppointmentStatus } from '../controllers/appointmentController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { patientOnly } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// All routes require the user to be logged in
router.use(protect);

// Only patients can create new appointments
router.post('/', patientOnly, createAppointment);

// Both patients and doctors can view their own appointments
router.get('/', getMyAppointments);

// Updating status (cancel, confirm, complete)
router.put('/:id/status', updateAppointmentStatus);

export default router;
