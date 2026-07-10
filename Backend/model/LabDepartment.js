import mongoose from 'mongoose';

const labDepartmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  bg: { type: String, required: true },
  text: { type: String, required: true }
}, { timestamps: true });

const LabDepartment = mongoose.model('LabDepartment', labDepartmentSchema);
export default LabDepartment;
