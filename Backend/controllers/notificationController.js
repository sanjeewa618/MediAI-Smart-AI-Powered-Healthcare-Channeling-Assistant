import mongoose from 'mongoose';
import Notification from '../model/Notification.js';
import NotificationSetting from '../model/NotificationSetting.js';

const listNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, isRead } = req.query;
    const filter = { user: req.user.id };

    if (isRead !== undefined) {
      filter.isRead = isRead === 'true';
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * pageSize;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      Notification.countDocuments(filter),
      Notification.countDocuments({ user: req.user.id, isRead: false })
    ]);

    res.status(200).json({
      success: true,
      data: notifications,
      meta: {
        total,
        unreadCount,
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid notification id' });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, data: notification });
  } catch (err) {
    next(err);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid notification id' });
    }

    const result = await Notification.findOneAndDelete({ _id: id, user: req.user.id });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, message: 'Notification deleted successfully' });
  } catch (err) {
    next(err);
  }
};

const createNotification = async (req, res, next) => {
  try {
    const { recipientId, title, message, type } = req.body;

    if (!recipientId || !mongoose.isValidObjectId(recipientId)) {
      return res.status(400).json({ success: false, message: 'Valid recipientId is required' });
    }

    const requiredFields = { title, message, type };
    for (const [key, val] of Object.entries(requiredFields)) {
      if (!val) {
        return res.status(400).json({ success: false, message: `${key} is required` });
      }
    }

    const validTypes = ['Appointment', 'LabResult', 'General', 'Promo', 'appointment', 'lab_report', 'system', 'message'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ success: false, message: `type must be one of: ${validTypes.join(', ')}` });
    }

    let dbType = type.toLowerCase();
    if (dbType === 'labresult') dbType = 'lab_report';
    if (dbType === 'general' || dbType === 'promo') dbType = 'system';

    const setting = await NotificationSetting.findOne({ user: recipientId });
    if (setting) {
      if ((type === 'Appointment' || type === 'appointment') && !setting.appointmentReminders) {
        return res.status(200).json({ success: true, message: 'Notification skipped due to user preference' });
      }
      if ((type === 'LabResult' || type === 'lab_report') && !setting.labResultAlerts) {
        return res.status(200).json({ success: true, message: 'Notification skipped due to user preference' });
      }
      if ((type === 'Promo' || type === 'promo') && !setting.promoNotifications) {
        return res.status(200).json({ success: true, message: 'Notification skipped due to user preference' });
      }
    }

    const notification = await Notification.create({
      user: recipientId,
      title,
      message,
      type: dbType,
      isRead: false
    });

    res.status(201).json({ success: true, data: notification });
  } catch (err) {
    next(err);
  }
};

const getNotificationSettings = async (req, res, next) => {
  try {
    let settings = await NotificationSetting.findOne({ user: req.user.id });

    if (!settings) {
      settings = await NotificationSetting.create({
        user: req.user.id,
        appointmentReminders: true,
        labResultAlerts: true,
        smsNotifications: false,
        emailNotifications: true,
        promoNotifications: false
      });
    }

    res.status(200).json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
};

const updateNotificationSettings = async (req, res, next) => {
  try {
    const allowedUpdates = [
      'appointmentReminders',
      'labResultAlerts',
      'smsNotifications',
      'emailNotifications',
      'promoNotifications'
    ];

    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No settings updates provided' });
    }

    const settings = await NotificationSetting.findOneAndUpdate(
      { user: req.user.id },
      { $set: updates },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
};

export {
  listNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  getNotificationSettings,
  updateNotificationSettings
};
