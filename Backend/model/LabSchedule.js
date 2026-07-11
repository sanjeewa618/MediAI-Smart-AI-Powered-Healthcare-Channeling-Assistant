import mongoose from 'mongoose';

const labScheduleSchema = new mongoose.Schema({
  lab: { type: mongoose.Schema.Types.ObjectId, ref: 'Lab', required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  maxPatients: { type: Number, required: true },
  nurse: { type: String },
  room: { type: String },
  type: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('LabSchedule', labScheduleSchema);
