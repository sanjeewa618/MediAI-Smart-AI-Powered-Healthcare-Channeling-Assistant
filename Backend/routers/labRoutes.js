import express from 'express';
import {
  getCategories, getLabs, getLabById, getLabAvailability,
  createBooking, getBookingByRef, listBookings, updateBookingStatus,
  getDashboardStats, updateLabStatus, getSchedule, createScheduleSlot, updateScheduleSlot,
  deleteScheduleSlot, listReports, createReport, updateReport, sendBookingReminder
} from '../controllers/labController.js';

import { protect } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/categories', getCategories);
router.get('/', getLabs);

router.use(protect);

router.get('/dashboard/stats', authorizeRoles('nurse', 'lab', 'admin'), getDashboardStats);
router.get('/bookings', authorizeRoles('patient', 'nurse', 'lab', 'admin'), listBookings);
router.post('/bookings', authorizeRoles('patient'), createBooking);
router.get('/bookings/:bookingRef', authorizeRoles('patient', 'nurse', 'lab', 'admin'), getBookingByRef);
router.patch('/bookings/:id/status', authorizeRoles('nurse', 'lab', 'admin'), updateBookingStatus);
router.post('/bookings/:id/remind', authorizeRoles('nurse', 'lab', 'admin'), sendBookingReminder);
router.patch('/:id/status', authorizeRoles('nurse', 'lab', 'admin'), updateLabStatus);
router.get('/reports', authorizeRoles('nurse', 'lab', 'admin'), listReports);
router.post('/reports', authorizeRoles('nurse', 'lab', 'admin'), createReport);
router.patch('/reports/:id', authorizeRoles('nurse', 'lab', 'admin'), updateReport);
router.patch('/schedule/:slotId', authorizeRoles('nurse', 'lab', 'admin'), updateScheduleSlot);
router.delete('/schedule/:slotId', authorizeRoles('nurse', 'lab', 'admin'), deleteScheduleSlot);
router.get('/:id', authorizeRoles('patient', 'nurse', 'lab', 'admin'), getLabById);
router.get('/:id/availability', authorizeRoles('patient', 'nurse', 'lab', 'admin'), getLabAvailability);
router.get('/:labId/schedule', authorizeRoles('nurse', 'lab', 'admin'), getSchedule);
router.post('/:labId/schedule', authorizeRoles('nurse', 'lab', 'admin'), createScheduleSlot);

export default router;
