import mongoose from 'mongoose';

const MongoDB_URL = 'mongodb+srv://sandun:200202@cluster0.olsh23e.mongodb.net/?appName=Cluster0';

async function run() {
  try {
    await mongoose.connect(MongoDB_URL);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Check doctor appointments
    const appointments = await db.collection('appointments').find({}).toArray();
    console.log(`Total doctor appointments: ${appointments.length}`);
    appointments.forEach(a => {
      console.log(`Appointment ID: ${a._id}, Patient: ${a.patient}, Doctor: ${a.doctor}, Date: ${a.date}, TimeSlot: ${a.timeSlot}, Status: ${a.status}`);
    });

    // Check lab bookings
    const labBookings = await db.collection('labbookings').find({}).toArray();
    console.log(`\nTotal lab bookings: ${labBookings.length}`);
    labBookings.forEach(l => {
      console.log(`Booking ID: ${l._id}, Patient: ${l.patient?.fullName}, Date: ${l.appointmentDate}, Status: ${l.status}, Ref: ${l.bookingRef}`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
