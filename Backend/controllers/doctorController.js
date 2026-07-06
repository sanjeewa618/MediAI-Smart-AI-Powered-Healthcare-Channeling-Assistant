import mongoose from 'mongoose';
import User from '../model/User.js';
import Appointment from '../model/Appointment.js';

// @desc    Get doctor dashboard data (Stats & Upcoming appointments)
// @route   GET /api/doctor/dashboard
// @access  Private (Doctor only)
export const getDoctorDashboard = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 1. Fetch upcoming appointments for the doctor
    const upcomingAppointments = await Appointment.find({
      doctor: req.user._id,
      date: { $gte: new Date() },
      status: { $in: ['pending', 'confirmed'] }
    })
      .populate('patient', 'name email phone')
      .sort({ date: 1 })
      .limit(10);

    // 2. Calculate Today's Appointments Count
    const todayAppointmentsCount = await Appointment.countDocuments({
      doctor: req.user._id,
      date: { $gte: todayStart, $lte: todayEnd },
      status: { $in: ['pending', 'confirmed'] }
    });

    // 3. Calculate Unique Patients Count
    // To get unique patients, we find all appointments for this doctor and distinct by patient
    const uniquePatients = await Appointment.distinct('patient', { doctor: req.user._id });
    const totalPatients = uniquePatients.length;

    res.json({
      success: true,
      data: {
        stats: {
          totalPatients,
          todayAppointments: todayAppointmentsCount
        },
        upcomingAppointments
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctor/profile
// @access  Private (Doctor only)
export const updateDoctorProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Basic info
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;

      // Doctor specific fields
      user.specialization = req.body.specialization || user.specialization;
      user.hospital = req.body.hospital || user.hospital;
      user.bio = req.body.bio || user.bio;
      user.experienceYears = req.body.experienceYears || user.experienceYears;
      user.consultationFee = req.body.consultationFee || user.consultationFee;

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

// @desc    Get all doctors (For patients to search and book)
// @route   GET /api/doctor
// @access  Private
export const getAllDoctors = async (req, res) => {
  try {
    const filter = { role: 'doctor' };
    
    // Optional filter by specialty from query string: ?specialty=Cardiology
    if (req.query.specialty && req.query.specialty !== 'All') {
      filter.specialization = req.query.specialty;
    }

    // Optional text search by name
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' };
    }

    const doctors = await User.find(filter)
      .select('-password')
      .sort({ name: 1 });

    res.json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
