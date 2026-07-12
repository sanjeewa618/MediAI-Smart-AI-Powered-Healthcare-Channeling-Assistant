import mongoose from 'mongoose';

const dailySessionSchema = new mongoose.Schema(
  {
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'started', 'ended'], 
      default: 'pending' 
    }
  },
  { timestamps: true }
);

// Ensure a doctor has only one session record per date and timeSlot
dailySessionSchema.index({ doctor: 1, date: 1, timeSlot: 1 }, { unique: true });

const DailySession = mongoose.model('DailySession', dailySessionSchema);
export default DailySession;
