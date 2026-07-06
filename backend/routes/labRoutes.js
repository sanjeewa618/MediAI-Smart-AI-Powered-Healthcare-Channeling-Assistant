const express = require('express');
const router = express.Router();

const {
  getCategories,
  getLabs,
  getLabById,
  getLabAvailability,
  createBooking,
  getBookingByRef,
  listBookings,
  updateBookingStatus,
  getDashboardStats,
  getSchedule,
  createScheduleSlot,
  updateScheduleSlot,
  deleteScheduleSlot,
  listReports,
  createReport,
  updateReport,
} = require('../controllers/labController');

const { authenticate, authorize } = require('../middleware/auth');

router.get('/categories', getCategories);
router.get('/', getLabs);

router.use(authenticate);

router.get(
  '/dashboard/stats',
  authorize('nurse', 'lab', 'admin'),
  getDashboardStats
);

router.get(
  '/bookings',
  authorize('nurse', 'lab', 'admin'),
  listBookings
);

router.post(
  '/bookings',
  authorize('patient'),
  createBooking
);

router.get(
  '/bookings/:bookingRef',
  authorize('patient', 'nurse', 'lab', 'admin'),
  getBookingByRef
);

router.patch(
  '/bookings/:id/status',
  authorize('nurse', 'lab', 'admin'),
  updateBookingStatus
);

router.get(
  '/reports',
  authorize('nurse', 'lab', 'admin'),
  listReports
);

router.post(
  '/reports',
  authorize('nurse', 'lab', 'admin'),
  createReport
);

router.patch(
  '/reports/:id',
  authorize('nurse', 'lab', 'admin'),
  updateReport
);

router.patch(
  '/schedule/:slotId',
  authorize('nurse', 'lab', 'admin'),
  updateScheduleSlot
);

router.delete(
  '/schedule/:slotId',
  authorize('nurse', 'lab', 'admin'),
  deleteScheduleSlot
);

router.get(
  '/:id',
  authorize('patient', 'nurse', 'lab', 'admin'),
  getLabById
);

router.get(
  '/:id/availability',
  authorize('patient', 'nurse', 'lab', 'admin'),
  getLabAvailability
);

router.get(
  '/:labId/schedule',
  authorize('nurse', 'lab', 'admin'),
  getSchedule
);

router.post(
  '/:labId/schedule',
  authorize('nurse', 'lab', 'admin'),
  createScheduleSlot
);

module.exports = router;
