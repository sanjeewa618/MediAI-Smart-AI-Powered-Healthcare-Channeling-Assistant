import mongoose from 'mongoose';

const DailySessionSchema = new mongoose.Schema({
  doctor: mongoose.Schema.Types.ObjectId,
  date: Date,
  timeSlot: String,
  status: String
});
const DailySession = mongoose.model('DailySession', DailySessionSchema, 'dailysessions');

async function checkSessions() {
  await mongoose.connect('mongodb://127.0.0.1:27017/healthcare');
  const sessions = await DailySession.find({});
  console.log('All DailySessions:');
  sessions.forEach(s => {
    console.log(`- ID: ${s._id}, Doctor: ${s.doctor}, Date: ${s.date.toISOString()}, TimeSlot: ${s.timeSlot}, Status: ${s.status}`);
  });
  process.exit(0);
}

checkSessions();
