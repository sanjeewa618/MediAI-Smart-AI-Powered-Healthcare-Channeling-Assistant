import User from '../model/User.js';
import Appointment from '../model/Appointment.js';
import MedicalRecord from '../model/MedicalRecord.js';

// @desc    Get all nurses (Optional filtering by department/lab category)
// @route   GET /api/nurse
// @access  Private (Accessible by authenticated users)
export const getAllNurses = async (req, res) => {
  try {
    const filter = { role: 'nurse' };

    // Optional filter by department from query string: ?department=Blood Test
    if (req.query.department && req.query.department !== 'All') {
      filter.department = req.query.department;
    }

    // Optional text search by name
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' };
    }

    const nurses = await User.find(filter)
      .select('-password')
      .sort({ name: 1 });

    res.json({
      success: true,
      count: nurses.length,
      data: nurses
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all appointments for today (to manage the clinic queue)
// @route   GET /api/nurse/appointments/today
// @access  Private (Nurse only)
export const getTodayAppointments = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      date: { $gte: todayStart, $lte: todayEnd }
    })
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialization')
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

// @desc    Update appointment status (e.g., patient has arrived/completed)
// @route   PUT /api/nurse/appointments/:id/status
// @access  Private (Nurse only)
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.status = status || appointment.status;
    const updatedAppointment = await appointment.save();

    res.json({
      success: true,
      data: updatedAppointment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Add initial medical notes or vitals for a patient
// @route   POST /api/nurse/medical-records
// @access  Private (Nurse only)
export const createMedicalRecord = async (req, res) => {
  try {
    const { patient, doctor, title, description } = req.body;

    if (!patient || !title) {
      return res.status(400).json({ message: 'Patient ID and Title are required' });
    }

    const newRecord = await MedicalRecord.create({
      patient,
      doctor, // Optional context if nurse knows which doctor is next
      title,
      description,
    });

    res.status(201).json({
      success: true,
      data: newRecord
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
