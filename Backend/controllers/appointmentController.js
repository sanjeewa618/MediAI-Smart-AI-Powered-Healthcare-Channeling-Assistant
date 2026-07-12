import Appointment from '../model/Appointment.js';
import User from '../model/User.js';
import DoctorAvailability from '../model/DoctorAvailability.js';

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Private (Patient only)
export const createAppointment = async (req, res) => {
  try {
    const { doctor, date, timeSlot, symptoms, notes } = req.body;

    // Verify the requested doctor actually exists and has the doctor role
    const doctorExists = await User.findById(doctor);
    if (!doctorExists || doctorExists.role !== 'doctor') {
      return res.status(400).json({ message: 'Invalid doctor selected' });
    }

    // Find the corresponding slot to check maxPatients
    // The timeSlot string is typically something like "09:00 AM - 09:30 AM"
    // We match the exact slot from DoctorAvailability using doctor, startTime, endTime
    const [startPart, endPart] = timeSlot.split(' - ');
    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(date).getDay()];
    
    // Find slot (either specific to this day or repeating daily)
    const slot = await DoctorAvailability.findOne({
      doctor,
      startTime: startPart,
      endTime: endPart,
      $or: [{ day: dayOfWeek }, { repeat: 'daily' }]
    });

    if (!slot) {
      return res.status(400).json({ message: 'Selected time slot is not available for this doctor' });
    }

    // Build a date range covering the whole selected day so the per-day
    // queue number is calculated correctly regardless of the incoming
    // date format.
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Count non-cancelled bookings already placed for this doctor in this
    // specific time slot on this date. This is the queue number for the
    // next patient in that slot. Queue numbers are per doctor, per date,
    // per time slot, reset daily, and must never exceed the slot's
    // maxPatients limit.
    const existingInSlot = await Appointment.countDocuments({
      doctor,
      timeSlot,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    });

    if (existingInSlot >= slot.maxPatients) {
      return res.status(400).json({ message: 'This time slot is fully booked. Please choose another slot.' });
    }

    const nextQueueNumber = existingInSlot + 1;

    const appointment = await Appointment.create({
      patient: req.user._id, // Automatically attach the logged-in patient
      doctor,
      date,
      timeSlot,
      queueNumber: nextQueueNumber,
      symptoms,
      notes
    });

    res.status(201).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all appointments for the logged-in user
// @route   GET /api/appointments
// @access  Private (Patient or Doctor)
export const getMyAppointments = async (req, res) => {
  try {
    let filter = {};
    
    // Automatically filter based on who is asking
    if (req.user.role === 'patient') {
      filter = { patient: req.user._id };
    } else if (req.user.role === 'doctor') {
      filter = { doctor: req.user._id };
    }

    // Optional date filter
    if (req.query.date) {
      const queryDate = new Date(req.query.date);
      const startOfDay = new Date(queryDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(queryDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    // If an Admin hits this route, they see everything because filter remains {}

    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialization hospital')
      .sort({ date: 1 });

    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update appointment status (confirm, cancel, complete)
// @route   PUT /api/appointments/:id/status
// @access  Private
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Security check: Only the involved patient, doctor, nurse, or admin can modify this
    if (
      appointment.patient.toString() !== req.user._id.toString() &&
      appointment.doctor.toString() !== req.user._id.toString() &&
      !['admin', 'nurse'].includes(req.user.role)
    ) {
      return res.status(403).json({ message: 'Not authorized to update this appointment' });
    }

    // Rule: Patients can only CANCEL their appointments, they cannot mark them as 'completed'
    if (req.user.role === 'patient' && status !== 'cancelled') {
      return res.status(403).json({ message: 'Patients are only allowed to cancel appointments.' });
    }

    appointment.status = status;
    const updatedAppointment = await appointment.save();

    res.json({
      success: true,
      data: updatedAppointment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
