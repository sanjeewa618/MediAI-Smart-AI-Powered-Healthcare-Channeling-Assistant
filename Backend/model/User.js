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
    
    // Patient Specific Profile
    nic: { type: String, trim: true },
    dob: { type: String, trim: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other', 'Rather not to say'], default: 'Other' },
    address: { type: String, trim: true },
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    height: { type: Number }, // in cm
    weight: { type: Number }, // in kg
    bmi: { type: Number },
    allergies: [{ type: String }],
    chronicConditions: [{ type: String }],

    // Doctor Specific Profile
    specialization: { type: String },
    department: { type: String }, // For Nurses (e.g. ICU, OPD)
    hospital: { type: String },
    bio: { type: String },
    experienceYears: { type: String },
    consultationFee: { type: Number },
    totalConsultations: { type: String },
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
