import Appointment from '../model/Appointment.js';
import User from '../model/User.js';
import DoctorAvailability from '../model/DoctorAvailability.js';
import DailySession from '../model/DailySession.js';
import Notification from '../model/Notification.js';

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
    const [startPart, endPart] = timeSlot.split(' - ');

    // Fix Timezone issue with Date parsing.
    // Strings like "YYYY-MM-DD" are parsed as UTC by default in JS.
    // If the server is in a timezone west of UTC, it will evaluate to the previous day locally!
    // Replacing '-' with '/' forces JS to parse it as local time.
    const normalizedDateStr = typeof date === 'string' && date.includes('-') && !date.includes('T') ? date.replace(/-/g, '/') : date;
    const appointmentDate = new Date(normalizedDateStr);
    
    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][appointmentDate.getDay()];
    const dateStr = appointmentDate.getFullYear() + '-' + String(appointmentDate.getMonth() + 1).padStart(2, '0') + '-' + String(appointmentDate.getDate()).padStart(2, '0');
    
    // Find slot: match by time and any applicable schedule rule
    // (matches the same logic used by the dashboard in doctorController)
    const slot = await DoctorAvailability.findOne({
      doctor,
      startTime: startPart,
      endTime: endPart,
      $or: [
        { day: dayOfWeek },              // Legacy weekday match (e.g. "Sat")
        { day: dateStr },                 // Specific date override (e.g. "2026-07-12")
        { repeat: 'daily' },             // Repeats every day
        { repeat: 'weekly', day: dayOfWeek }  // Repeats weekly on this weekday
      ]
    });

    if (!slot) {
      return res.status(400).json({ message: 'Selected time slot is not available for this doctor' });
    }

    // Build a date range covering the whole selected day
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingInSlot = await Appointment.countDocuments({
      doctor,
      timeSlot,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    });

    const existingPatientAppt = await Appointment.findOne({
      patient: req.user._id,
      doctor,
      timeSlot,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    });

    if (existingPatientAppt) {
      return res.status(400).json({ message: 'You have already booked an appointment for this exact time slot on this date.' });
    }

    if (existingInSlot >= slot.maxPatients) {
      return res.status(400).json({ message: 'This time slot is fully booked. Please choose another slot.' });
    }

    // Check explicitly tracked daily session state
    const sessionRecord = await DailySession.findOne({
      doctor,
      date: startOfDay,
      timeSlot
    });

    let initialStatus = 'pending';

    if (sessionRecord) {
      if (sessionRecord.status === 'ended') {
        return res.status(400).json({ message: 'This session has already ended. You cannot book appointments for this time slot anymore.' });
      } else if (sessionRecord.status === 'started') {
        const existingAppointments = await Appointment.find({
          doctor,
          timeSlot,
          date: { $gte: startOfDay, $lte: endOfDay },
          status: { $in: ['ready', 'started'] }
        });
        
        const hasReady = existingAppointments.some(app => app.status === 'ready');
        const hasStarted = existingAppointments.some(app => app.status === 'started');

        if (!hasReady && !hasStarted) {
          initialStatus = 'ready';
        } else {
          initialStatus = 'started';
        }
      }
    } else {
      // If no explicit session is tracked yet, auto-end if physical date is past today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startOfDay < today) {
        return res.status(400).json({ message: 'This session has already ended. You cannot book appointments for this time slot anymore.' });
      }
    }

    const maxQueueAppt = await Appointment.findOne({
      doctor,
      timeSlot,
      date: { $gte: startOfDay, $lte: endOfDay }
    }).sort('-queueNumber').select('queueNumber');

    const nextQueueNumber = maxQueueAppt && typeof maxQueueAppt.queueNumber === 'number' 
      ? maxQueueAppt.queueNumber + 1 
      : 1;

    const appointment = await Appointment.create({
      patient: req.user._id, // Automatically attach the logged-in patient
      doctor,
      date: appointmentDate,
      timeSlot,
      queueNumber: nextQueueNumber,
      status: initialStatus,
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
      const dateStr = String(req.query.date);
      const normalizedDateStr = dateStr.includes('-') && !dateStr.includes('T') ? dateStr.replace(/-/g, '/') : dateStr;
      const queryDate = new Date(normalizedDateStr);
      
      const startOfDay = new Date(queryDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(queryDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    // Optional status filter
    if (req.query.status && req.query.status !== 'all') {
      const statusStr = String(req.query.status).toLowerCase();
      if (statusStr === 'today') {
        filter.status = { $in: ['started', 'ready', 'nextin', 'skipped'] };
      } else if (statusStr === 'activein') {
        filter.status = { $in: ['ready', 'nextin', 'in'] };
      } else {
        filter.status = statusStr;
      }
    }

    // Optional search filter
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      const matchingUsers = await User.find({ name: searchRegex }).select('_id');
      const userIds = matchingUsers.map(u => u._id);
      
      filter.$or = [
        { patient: { $in: userIds } },
        { doctor: { $in: userIds } }
      ];
    }

    // If an Admin hits this route, they see everything matching the filters.
    // Calculate global stats for admin before returning. (Requested: Show ONLY today's counts for doctor side)
    let globalStats = null;
    if (req.user.role === 'admin') {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      
      const todayAppts = await Appointment.find({ date: { $gte: todayStart, $lte: todayEnd } });
      globalStats = {
        cancelled: todayAppts.filter(a => a.status === 'cancelled').length,
        pending: todayAppts.filter(a => a.status === 'pending').length,
        completed: todayAppts.filter(a => a.status === 'completed').length,
      };
    }

    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialization hospital photo')
      .sort({ date: 1 });

    res.json({
      success: true,
      count: appointments.length,
      data: appointments,
      stats: globalStats
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

    // Create notification for patient
    try {
      const doctorUser = await User.findById(appointment.doctor);
      const doctorName = doctorUser ? doctorUser.name : 'Doctor';
      const formattedDate = new Date(appointment.date).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      let title = `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)}`;
      let message = `Your appointment with ${doctorName} on ${formattedDate} at ${appointment.timeSlot} has been updated to ${status}.`;

      if (status === 'confirmed') {
        title = 'Appointment Accepted';
        message = `Dr. ${doctorName.replace(/^Dr\.\s*/i, '')} has accepted your appointment on ${formattedDate} at ${appointment.timeSlot}.`;
      } else if (status === 'cancelled') {
        title = 'Appointment Cancelled';
        message = `Your appointment with Dr. ${doctorName.replace(/^Dr\.\s*/i, '')} on ${formattedDate} at ${appointment.timeSlot} has been cancelled.`;
      }

      await Notification.create({
        user: appointment.patient,
        title,
        message,
        type: 'appointment',
        isRead: false
      });
    } catch (err) {
      console.error('Failed to create appointment status update notification:', err);
    }

    res.json({
      success: true,
      data: updatedAppointment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
