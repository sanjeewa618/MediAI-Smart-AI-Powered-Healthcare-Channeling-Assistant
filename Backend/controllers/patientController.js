import mongoose from 'mongoose';
import User from '../model/User.js';
import Appointment from '../model/Appointment.js';
import LabTest from '../model/LabTest.js';

// @desc    Get patient dashboard summary (Upcoming appointments & lab tests)
// @route   GET /api/patient/dashboard
// @access  Private (Patient only)
export const getDashboardData = async (req, res) => {
  try {
    // 1. Fetch upcoming doctor appointments (Populating doctor details for the UI)
    const doctorAppointments = await Appointment.find({
      patient: req.user._id,
      date: { $gte: new Date() },
      status: { $in: ['pending', 'confirmed'] }
    })
      .populate('doctor', 'name specialization hospital')
      .sort({ date: 1 })
      .limit(5);

    // 2. Fetch upcoming lab tests
    const labAppointments = await LabTest.find({
      patient: req.user._id,
      date: { $gte: new Date() },
      status: { $in: ['pending', 'scheduled'] }
    })
      .sort({ date: 1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        doctorAppointments,
        labAppointments,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update patient profile
// @route   PUT /api/patient/profile
// @access  Private (Patient only)
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Update fields if they were provided in the request body
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      if (req.body.nic !== undefined) user.nic = req.body.nic;
      if (req.body.dob !== undefined) user.dob = req.body.dob;
      if (req.body.gender !== undefined) user.gender = req.body.gender;
      if (req.body.address !== undefined) user.address = req.body.address;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        data: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role: updatedUser.role,
        }
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
