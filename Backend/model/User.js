import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['patient', 'doctor', 'nurse', 'admin'], default: 'patient' },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'active', 'suspended', 'disabled', 'verified'], default: 'approved' },
    staffId: { type: String }, // Store Doctor ID or Nurse ID
    
    // Doctor Specific Profile
    specialization: { type: String },
    department: { type: String }, // For Nurses (e.g. ICU, OPD)
    hospital: { type: String },
    bio: { type: String },
    experienceYears: { type: Number },
    consultationFee: { type: Number },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
export default User;
