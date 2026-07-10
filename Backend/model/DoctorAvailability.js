import mongoose from 'mongoose';

const doctorAvailabilitySchema = new mongoose.Schema(
  {
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    day: { type: String, required: true }, // 'Mon', 'Tue', etc.
    startTime: { type: String, required: true }, // e.g. '09:00 AM'
    endTime: { type: String, required: true }, // e.g. '09:30 AM'
    type: { 
      type: String, 
      enum: ['available', 'booked', 'break', 'blocked'], 
      default: 'available' 
    },
    consultType: { 
      type: String, 
      enum: ['Physical', 'Video', 'Both', ''], 
      default: 'Physical' 
    },
    maxPatients: { type: Number, default: 1 },
    notes: { type: String, default: '' },
    repeat: { 
      type: String, 
      enum: ['none', 'daily', 'weekly'], 
      default: 'none' 
    },
  },
  { timestamps: true }
);

// Map frontend id to Mongoose _id automatically
doctorAvailabilitySchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const DoctorAvailability = mongoose.model('DoctorAvailability', doctorAvailabilitySchema);
export default DoctorAvailability;
