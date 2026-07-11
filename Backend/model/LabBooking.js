import mongoose from 'mongoose';

const labBookingSchema = new mongoose.Schema({
  bookingRef: { type: String, required: true, unique: true },
  lab: { type: mongoose.Schema.Types.ObjectId, ref: 'Lab', required: true },
  scheduleSlot: { type: mongoose.Schema.Types.ObjectId, ref: 'LabSchedule', required: true },
  patientUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  appointmentDate: { type: Date, required: true },
  patient: {
    fullName: { type: String, required: true },
    nic: { type: String, required: true },
    gender: { type: String, required: true },
    mobile: { type: String, required: true }
  },
  collectionMethod: { type: String, enum: ['Hospital', 'Home'], required: true },
  homeAddress: { type: String },
  paymentMethod: { type: String, enum: ['Card', 'Cash'], required: true },
  paymentStatus: { type: String, enum: ['Paid', 'Pending'], required: true },
  referralImageUrl: { type: String },
  queueToken: { type: Number },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Checked-In', 'Sample-Collected', 'Testing', 'Completed', 'Cancelled'], default: 'Pending' },
  checkedInAt: { type: Date },
  completedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('LabBooking', labBookingSchema);
