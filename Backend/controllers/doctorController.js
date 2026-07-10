import mongoose from 'mongoose';
import User from '../model/User.js';
import Appointment from '../model/Appointment.js';
import DoctorAvailability from '../model/DoctorAvailability.js';

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
      if (req.body.email) {
        user.email = req.body.email.toLowerCase();
      }

      // Doctor specific fields
      user.specialization = req.body.specialization || user.specialization;
      user.hospital = req.body.hospital || user.hospital;
      user.bio = req.body.bio || user.bio;
      user.experienceYears = req.body.experienceYears || user.experienceYears;
      user.consultationFee = req.body.consultationFee || user.consultationFee;
      user.totalConsultations = req.body.totalConsultations || user.totalConsultations;

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

// @desc    Get all schedule slots for the logged in doctor
// @route   GET /api/doctor/schedule
// @access  Private (Doctor only)
export const getDoctorSchedule = async (req, res) => {
  try {
    const slots = await DoctorAvailability.find({ doctor: req.user._id });
    res.json({ success: true, data: slots });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create a new schedule slot
// @route   POST /api/doctor/schedule
// @access  Private (Doctor only)
export const createDoctorSchedule = async (req, res) => {
  try {
    const { day, startTime, endTime, type, consultType, maxPatients, notes } = req.body;
    
    const newSlot = await DoctorAvailability.create({
      doctor: req.user._id,
      day,
      startTime,
      endTime,
      type: type || 'available',
      consultType: consultType || 'Physical',
      maxPatients: maxPatients || 1,
      notes: notes || ''
    });

    res.status(201).json({ success: true, data: newSlot });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update a schedule slot
// @route   PUT /api/doctor/schedule/:id
// @access  Private (Doctor only)
export const updateDoctorSchedule = async (req, res) => {
  try {
    const slot = await DoctorAvailability.findOne({ _id: req.params.id, doctor: req.user._id });
    
    if (!slot) {
      return res.status(404).json({ message: 'Schedule slot not found or unauthorized' });
    }

    // Update fields
    const { day, startTime, endTime, type, consultType, maxPatients, notes } = req.body;
    
    if (day !== undefined) slot.day = day;
    if (startTime !== undefined) slot.startTime = startTime;
    if (endTime !== undefined) slot.endTime = endTime;
    if (type !== undefined) slot.type = type;
    if (consultType !== undefined) slot.consultType = consultType;
    if (maxPatients !== undefined) slot.maxPatients = maxPatients;
    if (notes !== undefined) slot.notes = notes;

    const updatedSlot = await slot.save();
    res.json({ success: true, data: updatedSlot });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a schedule slot
// @route   DELETE /api/doctor/schedule/:id
// @access  Private (Doctor only)
export const deleteDoctorSchedule = async (req, res) => {
  try {
    const slot = await DoctorAvailability.findOne({ _id: req.params.id, doctor: req.user._id });
    
    if (!slot) {
      return res.status(404).json({ message: 'Schedule slot not found or unauthorized' });
    }

    await slot.deleteOne();
    res.json({ success: true, message: 'Schedule slot removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


