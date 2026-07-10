import mongoose from 'mongoose';

const doctorCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }
}, { timestamps: true });

const DoctorCategory = mongoose.model('DoctorCategory', doctorCategorySchema);
export default DoctorCategory;
