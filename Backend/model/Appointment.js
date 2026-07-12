import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    queueNumber: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ['pending', 'confirmed', 'started', 'ready', 'in', 'nextIn', 'skipped', 'completed', 'cancelled'], default: 'pending' },
    symptoms: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

// Helpful index to quickly count/find queue numbers per doctor per date.
appointmentSchema.index({ doctor: 1, date: 1, queueNumber: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;