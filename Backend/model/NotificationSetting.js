import mongoose from 'mongoose';

const notificationSettingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  appointmentReminders: { type: Boolean, default: true },
  labResultAlerts: { type: Boolean, default: true },
  smsNotifications: { type: Boolean, default: false },
  emailNotifications: { type: Boolean, default: true },
  promoNotifications: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('NotificationSetting', notificationSettingSchema);
