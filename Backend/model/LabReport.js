import mongoose from 'mongoose';

const labReportSchema = new mongoose.Schema({
  refNo: { type: String, required: true, unique: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'LabBooking', required: true },
  lab: { type: mongoose.Schema.Types.ObjectId, ref: 'Lab', required: true },
  patient: { type: Object, required: true },
  testType: { type: String, required: true },
  category: { type: String, required: true },
  result: { type: String, required: true },
  status: { type: String, required: true },
  nurse: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reportDate: { type: Date, required: true },
  notes: { type: String },
  reportUrl: { type: String }
}, { timestamps: true });

export default mongoose.model('LabReport', labReportSchema);
