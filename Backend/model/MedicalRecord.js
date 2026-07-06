import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    description: { type: String },
    attachments: [{ type: String }],
    recordDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

mongoose.model('MedicalRecord', medicalRecordSchema);
export default medicalRecordSchema;
