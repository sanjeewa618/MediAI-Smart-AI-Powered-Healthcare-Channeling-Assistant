import User from '../model/User.js';
import Appointment from '../model/Appointment.js';
import MedicalRecord from '../model/MedicalRecord.js';
import LabDepartment from '../model/LabDepartment.js';
import Lab from '../model/Lab.js';
import LabCategory from '../model/LabCategory.js';
import LabBooking from '../model/LabBooking.js';

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

// @desc    Get all lab departments
// @route   GET /api/nurse/departments
// @access  Public
export const getLabDepartments = async (req, res) => {
  try {
    let departments = await LabDepartment.find().sort({ name: 1 });
    
    // Auto-seed if empty for convenience
    if (departments.length === 0) {
      const defaultDepartments = [
        { name: 'Blood Test', bg: '#FEE2E2', text: '#EF4444' },
        { name: 'Urine Test', bg: '#FEF3C7', text: '#D97706' },
        { name: 'Diabetes', bg: '#E0F2FE', text: '#0EA5E9' },
        { name: 'Heart', bg: '#FCE7F3', text: '#DB2777' },
        { name: 'Liver', bg: '#F0FDF4', text: '#16A34A' },
        { name: 'Pregnancy', bg: '#FFF1F2', text: '#E11D48' }
      ];
      await LabDepartment.insertMany(defaultDepartments);
      departments = await LabDepartment.find().sort({ name: 1 });
    }

    res.json({ success: true, data: departments });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update nurse profile
// @route   PUT /api/nurse/profile
// @access  Private (Nurse only)
export const updateNurseProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      if (req.body.email) {
        user.email = req.body.email.toLowerCase();
      }

      // Nurse specific fields
      user.staffId = req.body.staffId || user.staffId;
      user.department = req.body.department || user.department;
      user.hospital = req.body.hospital || user.hospital;
      user.experienceYears = req.body.experienceYears || user.experienceYears;
      user.bio = req.body.bio || user.bio;
      user.photo = req.body.photo || user.photo;
      if (req.body.certifications !== undefined) {
        user.certifications = req.body.certifications;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        data: updatedUser
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Upload nurse avatar
// @route   POST /api/nurse/profile/upload-avatar
// @access  Private (Nurse only)
export const uploadNurseAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file' });
    }
    const user = await User.findById(req.user._id);

    if (user) {
      const avatarUrl = `/uploads/${req.file.filename}`;
      user.photo = avatarUrl;
      const updatedUser = await user.save();
      res.json({
        success: true,
        message: 'Avatar uploaded successfully',
        photo: avatarUrl,
        data: updatedUser
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get nurse profile stats (Tests Done, Completed This Month, etc.)
// @route   GET /api/nurse/profile/stats
// @access  Private (Nurse only)
export const getNurseStats = async (req, res) => {
  try {
    const filter = {};

    if (req.user && req.user.department) {
      // Find labs associated with nurse's department
      const category = await LabCategory.findOne({ name: { $regex: new RegExp(`^${req.user.department}`, 'i') } });
      if (category) {
        const labs = await Lab.find({ category: category._id });
        filter.lab = { $in: labs.map(l => l._id) };
      } else {
        return res.json({
          success: true,
          data: {
            totalTestsDone: 0,
            completedThisMonth: 0,
            accuracy: "99.2%",
            rating: "4.8"
          }
        });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Nurse department not set' });
    }

    // 1. Total Completed bookings
    const totalTestsDone = await LabBooking.countDocuments({
      ...filter,
      status: 'Completed'
    });

    // 2. Completed bookings this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const completedThisMonth = await LabBooking.countDocuments({
      ...filter,
      status: 'Completed',
      completedAt: { $gte: startOfMonth }
    });

    res.json({
      success: true,
      data: {
        totalTestsDone,
        completedThisMonth,
        accuracy: "99.2%",
        rating: "4.8"
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
