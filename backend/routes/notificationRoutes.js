const express = require('express');
const router = express.Router();

const {
  listNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  getNotificationSettings,
  updateNotificationSettings
} = require('../controllers/notificationController');

const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get(
  '/settings',
  authorize('patient', 'doctor', 'nurse', 'lab', 'admin'),
  getNotificationSettings
);

router.patch(
  '/settings',
  authorize('patient', 'doctor', 'nurse', 'lab', 'admin'),
  updateNotificationSettings
);

router.patch(
  '/read-all',
  authorize('patient', 'doctor', 'nurse', 'lab', 'admin'),
  markAllAsRead
);

router.get(
  '/',
  authorize('patient', 'doctor', 'nurse', 'lab', 'admin'),
  listNotifications
);

router.post(
  '/',
  authorize('doctor', 'nurse', 'lab', 'admin'),
  createNotification
);

router.patch(
  '/:id/read',
  authorize('patient', 'doctor', 'nurse', 'lab', 'admin'),
  markAsRead
);

router.delete(
  '/:id',
  authorize('patient', 'doctor', 'nurse', 'lab', 'admin'),
  deleteNotification
);

module.exports = router;
