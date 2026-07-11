import mongoose from 'mongoose';

const labSchema = new mongoose.Schema({
  name: { type: String, required: true },
  floor: { type: String },
  openTime: { type: String },
  closeTime: { type: String },
  description: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'LabCategory' },
  assignedNurse: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Available', 'Busy', 'Overloaded', 'Closed', 'Maintenance'], default: 'Available' }
}, { timestamps: true });

export default mongoose.model('Lab', labSchema);
