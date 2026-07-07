import mongoose from 'mongoose';

const labTestSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    testName: { type: String, required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    status: { type: String, enum: ['pending', 'scheduled', 'completed', 'cancelled'], default: 'pending' },
    reportUrl: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

const LabTest = mongoose.model('LabTest', labTestSchema);
export default LabTest;
