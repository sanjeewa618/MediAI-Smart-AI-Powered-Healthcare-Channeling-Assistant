import mongoose from 'mongoose';
import User from '../model/User.js';
import Appointment from '../model/Appointment.js';
import LabTest from '../model/LabTest.js';
import MedicalRecord from '../model/MedicalRecord.js';

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
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      user.dob = req.body.dob || user.dob;
      user.gender = req.body.gender || user.gender;
      user.address = req.body.address || user.address;
      user.bloodGroup = req.body.bloodGroup || user.bloodGroup;
      user.height = req.body.height || user.height;
      user.weight = req.body.weight || user.weight;
      user.bmi = req.body.bmi || user.bmi;
      
      // Since allergies and chronicConditions are arrays of strings, we can just replace them
      if (req.body.allergies) {
        user.allergies = req.body.allergies;
      }
      if (req.body.chronicConditions) {
        user.chronicConditions = req.body.chronicConditions;
      }
      if (req.body.emergencyContacts) {
        user.emergencyContacts = req.body.emergencyContacts;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        data: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          dob: updatedUser.dob,
          gender: updatedUser.gender,
          address: updatedUser.address,
          bloodGroup: updatedUser.bloodGroup,
          height: updatedUser.height,
          weight: updatedUser.weight,
          bmi: updatedUser.bmi,
          allergies: updatedUser.allergies,
          chronicConditions: updatedUser.chronicConditions,
          emergencyContacts: updatedUser.emergencyContacts
        }
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Upload patient insurance document
// @route   POST /api/patient/upload-insurance
// @access  Private (Patient only)
export const uploadInsuranceDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    // URL to access the uploaded file
    const documentUrl = `/uploads/${req.file.filename}`;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.insurance = {
      ...user.insurance,
      documentUrl: documentUrl
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Insurance document uploaded successfully',
      data: {
        documentUrl: documentUrl
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error during file upload', error: error.message });
  }
};

// @desc    Get patient profile stats (total & completed appointments)
// @route   GET /api/patient/stats
// @access  Private (Patient only)
export const getPatientStats = async (req, res) => {
  try {
    const totalAppointments = await Appointment.countDocuments({ patient: req.user._id });
    const completedAppointments = await Appointment.countDocuments({ patient: req.user._id, status: 'completed' });

    res.json({
      success: true,
      data: {
        totalAppointments,
        completedAppointments
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get patient reports
// @route   GET /api/patient/reports
// @access  Private (Patient only)
export const getPatientReports = async (req, res) => {
  try {
    const reports = await MedicalRecord.find({ patient: req.user._id }).sort({ recordDate: -1 });
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching reports', error: error.message });
  }
};

// @desc    Upload a patient report
// @route   POST /api/patient/reports/upload
// @access  Private (Patient only)
export const uploadPatientReport = async (req, res) => {
  try {
    const { title, category, recordDate } = req.body;
    
    if (!title || !category) {
      return res.status(400).json({ message: 'Title and category are required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const documentUrl = `/uploads/${req.file.filename}`;

    const newRecord = new MedicalRecord({
      patient: req.user._id,
      title,
      category,
      recordDate: recordDate ? new Date(recordDate) : Date.now(),
      attachments: [documentUrl]
    });

    await newRecord.save();

    res.status(201).json({
      success: true,
      message: 'Report uploaded successfully',
      data: newRecord
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error uploading report', error: error.message });
  }
};
