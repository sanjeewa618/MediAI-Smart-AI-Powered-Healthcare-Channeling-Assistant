import express from 'express';
import {
  listNotifications, markAsRead, markAllAsRead, deleteNotification,
  createNotification, getNotificationSettings, updateNotificationSettings
} from '../controllers/notificationController.js';

import { protect } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/settings', authorizeRoles('patient', 'doctor', 'nurse', 'lab', 'admin'), getNotificationSettings);
router.patch('/settings', authorizeRoles('patient', 'doctor', 'nurse', 'lab', 'admin'), updateNotificationSettings);
router.patch('/read-all', authorizeRoles('patient', 'doctor', 'nurse', 'lab', 'admin'), markAllAsRead);
router.get('/', authorizeRoles('patient', 'doctor', 'nurse', 'lab', 'admin'), listNotifications);
router.post('/', authorizeRoles('doctor', 'nurse', 'lab', 'admin'), createNotification);
router.patch('/:id/read', authorizeRoles('patient', 'doctor', 'nurse', 'lab', 'admin'), markAsRead);
router.delete('/:id', authorizeRoles('patient', 'doctor', 'nurse', 'lab', 'admin'), deleteNotification);

export default router;
