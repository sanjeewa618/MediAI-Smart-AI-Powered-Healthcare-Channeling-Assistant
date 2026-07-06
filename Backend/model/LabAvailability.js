import mongoose from 'mongoose';

const labAvailabilitySchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    timeSlots: [{
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
      currentBookings: { type: Number, default: 0 },
      maxCapacity: { type: Number, default: 5 }
    }],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const LabAvailability = mongoose.model('LabAvailability', labAvailabilitySchema);
export default LabAvailability;
