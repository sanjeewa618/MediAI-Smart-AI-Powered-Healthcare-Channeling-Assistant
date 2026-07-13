import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../model/User.js';
import Appointment from '../model/Appointment.js';
import DoctorAvailability from '../model/DoctorAvailability.js';
import DailySession from '../model/DailySession.js';
import Specialty from '../model/Specialty.js';
import MedicalRecord from '../model/MedicalRecord.js';
import jwt from 'jsonwebtoken';

// @desc    Get doctor dashboard data (Stats & Upcoming appointments)
// @route   GET /api/doctor/dashboard
// @access  Private (Doctor only)
export const getDoctorDashboard = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 1. Fetch upcoming appointments for the doctor (Future)
    const upcomingAppointments = await Appointment.find({
      doctor: req.user._id,
      date: { $gte: new Date() },
      status: { $in: ['pending', 'confirmed'] }
    })
      .populate('patient', 'name email phone')
      .sort({ date: 1 })
      .limit(10);

    // 2. Calculate Today's Appointments Count (Excluding pending and cancelled appointments)
    const todayAppointments = await Appointment.find({
      doctor: req.user._id,
      date: { $gte: todayStart, $lte: todayEnd },
      status: { $in: ['pending', 'confirmed', 'started', 'ready', 'in', 'skipped', 'completed'] }
    }).populate('patient', 'name email phone').sort({ queueNumber: 1 });

    const todayAppointmentsCount = todayAppointments.length;
    const completedTodayCount = todayAppointments.filter(app => app.status === 'completed').length;
    const pendingTodayCount = todayAppointments.filter(app => app.status === 'pending').length;

    // 4. Fetch today's slots
    const today = new Date();
    const todayDayName = today.toLocaleDateString('en-US', { weekday: 'short' });
    const todayDateStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');

    const availabilities = await DoctorAvailability.find({ doctor: req.user._id });
    let todaySlots = availabilities.filter(s => 
      s.repeat === 'daily' || 
      (s.repeat === 'weekly' && s.day === todayDayName) || 
      s.day === todayDayName || 
      s.day === todayDateStr
    ).sort((a, b) => a.startTime.localeCompare(b.startTime));

    // Fetch DailySessions for today to get actual session statuses
    const dailySessions = await DailySession.find({
      doctor: req.user._id,
      date: todayStart
    });

    todaySlots = todaySlots.map(slot => {
      const timeSlotStr = `${slot.startTime} - ${slot.endTime}`;
      const session = dailySessions.find(ds => ds.timeSlot === timeSlotStr);
      return {
        ...slot._doc,
        id: slot._id,
        sessionStatus: session ? session.status : 'pending'
      };
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalPatients: completedTodayCount,
          todayAppointments: todayAppointmentsCount,
          pendingApprovals: pendingTodayCount
        },
        upcomingAppointments,
        todayAppointments,
        todaySlots
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
    const filter = { role: 'doctor', status: 'approved' };
    
    // Optional filter by specialty from query string: ?specialty=Cardiology
    if (req.query.specialty && req.query.specialty !== 'All') {
      const searchStr = req.query.specialty;
      if (searchStr.toLowerCase().includes('general')) {
        filter.specialization = { $regex: 'General', $options: 'i' };
      } else {
        // Strip common suffixes to match variations like Cardiology <-> Cardiologist
        const baseSpecialty = searchStr.replace(/(ist|y|ian|ic|ics|s)$/i, '');
        filter.specialization = { $regex: baseSpecialty, $options: 'i' };
      }
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
    const { day, startTime, endTime, type, consultType, maxPatients, notes, repeat } = req.body;
    
    const newSlot = await DoctorAvailability.create({
      doctor: req.user._id,
      day,
      startTime,
      endTime,
      type: type || 'available',
      consultType: consultType || 'Physical',
      maxPatients: maxPatients || 1,
      notes: notes || '',
      repeat: repeat || 'none'
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
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ message: 'Password is required to delete a schedule slot' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    const slot = await DoctorAvailability.findOne({ _id: req.params.id, doctor: req.user._id });
    
    if (!slot) {
      return res.status(404).json({ message: 'Schedule slot not found' });
    }

    const slotTimeSlot = `${slot.startTime} - ${slot.endTime}`;
    await slot.deleteOne();

    // Intelligently cancel all future appointments that were booked for this deleted time slot
    // making sure to only cancel appointments on the same day of the week as the deleted slot!
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const futureAppointments = await Appointment.find({
      doctor: req.user._id,
      timeSlot: slotTimeSlot,
      date: { $gte: todayStart },
      status: { $in: ['pending', 'confirmed'] }
    });

    const dayMap = { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 };
    const targetDay = dayMap[slot.day];

    const toCancelIds = futureAppointments
      .filter(appt => new Date(appt.date).getDay() === targetDay)
      .map(appt => appt._id);

    if (toCancelIds.length > 0) {
      await Appointment.updateMany(
        { _id: { $in: toCancelIds } },
        { $set: { status: 'cancelled' } }
      );
    }

    res.json({ success: true, message: 'Schedule slot removed and future appointments cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all doctor specialties
// @route   GET /api/doctor/specialties
// @access  Public
export const getSpecialties = async (req, res) => {
  try {
    let specialties = await Specialty.find().sort({ name: 1 });
    
    // Auto-seed if empty for convenience
    if (specialties.length === 0) {
      const defaultSpecialties = [
        { name: 'Cardiology', bg: '#FFF1F2', text: '#E11D48' },
        { name: 'Paediatrics', bg: '#E0F2FE', text: '#0EA5E9' },
        { name: 'Urology', bg: '#F0FDF4', text: '#22C55E' },
        { name: 'Oncology', bg: '#FFF7ED', text: '#F97316' },
        { name: 'Dermatology', bg: '#F5F3FF', text: '#724CF9' },
        { name: 'Neurology', bg: '#FDF2F8', text: '#DB2777' },
        { name: 'Orthopedics', bg: '#F1F5F9', text: '#475569' },
        { name: 'Ophthalmology', bg: '#FFF7ED', text: '#EA580C' }
      ];
      await Specialty.insertMany(defaultSpecialties);
      specialties = await Specialty.find().sort({ name: 1 });
    }

    res.json({ success: true, data: specialties });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get dynamic calendar availability for a doctor
// @route   GET /api/doctor/:id/availability
// @access  Public
export const getDoctorAvailabilityForPatient = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const { month, year } = req.query;

    let patientId = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        patientId = decoded.id;
      } catch (err) {
        // gracefully ignore invalid token for public calendar access
      }
    }

    const targetDate = new Date();
    const targetMonth = month !== undefined ? parseInt(month) : targetDate.getMonth();
    const targetYear = year !== undefined ? parseInt(year) : targetDate.getFullYear();

    // 1. Get doctor's availability template
    const slots = await DoctorAvailability.find({ doctor: doctorId });

    // 2. Find start and end of the month
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0);

    // 3. Fetch all active appointments and sessions for this doctor in this month
    const appointments = await Appointment.find({
      doctor: doctorId,
      date: { $gte: startDate, $lte: endDate }
    });

    const sessions = await DailySession.find({
      doctor: doctorId,
      date: { $gte: startDate, $lte: endDate }
    });

    // Group sessions by date string (YYYY-MM-DD) and timeSlot
    const sessionStatusMap = {};
    sessions.forEach(sess => {
      const sessDate = new Date(sess.date);
      const m = String(sessDate.getMonth() + 1).padStart(2, '0');
      const d = String(sessDate.getDate()).padStart(2, '0');
      const dateStr = `${sessDate.getFullYear()}-${m}-${d}`;
      const key = `${dateStr}_${sess.timeSlot}`;
      sessionStatusMap[key] = sess.status;
    });

    // Group appointments by date string (YYYY-MM-DD) and timeSlot so we
    // can compute the per-slot queue number. Queue numbers are per
    // doctor, per date, per time slot, and reset daily.
    const appointmentCounts = {};
    appointments.forEach(app => {
      const appDate = new Date(app.date);
      const m = String(appDate.getMonth() + 1).padStart(2, '0');
      const d = String(appDate.getDate()).padStart(2, '0');
      const dateStr = `${appDate.getFullYear()}-${m}-${d}`;
      
      const key = `${dateStr}_${app.timeSlot}`;
      if (!appointmentCounts[key]) {
        appointmentCounts[key] = { active: 0, highestQueue: 0, hasBooked: false };
      }
      
      // Active slots consumed (cancellations free up a slot)
      if (app.status !== 'cancelled') {
        appointmentCounts[key].active++;
        if (patientId && app.patient.toString() === patientId) {
          appointmentCounts[key].hasBooked = true;
        }
      }
      
      // Highest queue number assigned (to ensure monotonic strictly increasing queue numbers)
      const q = Number(app.queueNumber) || 0;
      if (q > appointmentCounts[key].highestQueue) {
        appointmentCounts[key].highestQueue = q;
      }
    });

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const numDays = endDate.getDate();
    const availabilityCalendar = [];

    // 4. Generate calendar with slot capacities
    for (let i = 1; i <= numDays; i++) {
      const date = new Date(targetYear, targetMonth, i);
      // Pad month and day for proper formatting (e.g. 2026-07-20)
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const y = date.getFullYear();
      const dateStr = `${y}-${m}-${d}`;
      const dayOfWeekStr = dayNames[date.getDay()];

      // Find slots applicable to this day (daily repeats, weekly repeats matching weekday, legacy weekday matches, or specific date overrides)
      const applicableSlots = slots.filter(s => 
        s.repeat === 'daily' || 
        (s.repeat === 'weekly' && s.day === dayOfWeekStr) || 
        s.day === dayOfWeekStr || 
        s.day === dateStr
      );

      const daySlots = applicableSlots.map(s => {
        const timeSlotStr = `${s.startTime} - ${s.endTime}`;
        const key = `${dateStr}_${timeSlotStr}`;
        const slotData = appointmentCounts[key] || { active: 0, highestQueue: 0 };
        const bookedCount = slotData.active;
        const maxPatients = s.maxPatients || 1;
        
        // The queue number strictly increments based on the highest queue number generated so far.
        // It never re-uses numbers even if there are cancellations.
        const nextQueueNumber = slotData.highestQueue + 1;
        
        const isEnded = sessionStatusMap[key] === 'ended';
        const hasBooked = slotData.hasBooked || false;

        return {
          id: s._id,
          startTime: s.startTime,
          endTime: s.endTime,
          timeSlot: timeSlotStr,
          maxPatients,
          bookedCount,
          isFull: bookedCount >= maxPatients || isEnded,
          isEnded,
          hasBooked,
          type: s.type,
          consultType: s.consultType,
          notes: s.notes,
          nextQueueNumber
        };
      });

      availabilityCalendar.push({
        date: dateStr,
        dayName: dayOfWeekStr,
        slots: daySlots
      });
    }

    res.json({ success: true, data: availabilityCalendar });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get patient profile and reports for doctor
// @route   GET /api/doctor/patient/:id
// @access  Private (Doctor only)
export const getPatientDetailsForDoctor = async (req, res) => {
  try {
    const patient = await User.findById(req.params.id);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }
    const reports = await MedicalRecord.find({ patient: req.params.id }).sort({ recordDate: -1 });
    res.json({
      success: true,
      data: {
        patient,
        reports
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Start or End a specific session for a date
// @route   PUT /api/doctor/session/:action
// @access  Private (Doctor only)
export const updateSessionState = async (req, res) => {
  try {
    const { action } = req.params; // 'start' or 'end'
    const { timeSlot } = req.body;
    
    if (!['start', 'end'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }
    
    if (!timeSlot) {
      return res.status(400).json({ message: 'timeSlot is required' });
    }

    // Use server time to perfectly match getDoctorDashboard's todayStart
    const targetDate = new Date();
    targetDate.setHours(0, 0, 0, 0);

    const newStatus = action === 'start' ? 'started' : 'ended';

    if (action === 'start') {
      const activeSession = await DailySession.findOne({
        doctor: req.user._id,
        date: targetDate,
        status: 'started'
      });

      if (activeSession && activeSession.timeSlot !== timeSlot) {
        // Self-healing: The frontend blocks starting if a visible session is active.
        // If we reach here, it's either a ghost session (deleted slot) or concurrent bypass.
        // We auto-end any dangling started sessions to maintain the single-session constraint.
        await DailySession.updateMany(
          { doctor: req.user._id, date: targetDate, status: 'started' },
          { $set: { status: 'ended' } }
        );
      }
    } else if (action === 'end') {
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      await Appointment.updateMany(
        { 
          doctor: req.user._id, 
          date: { $gte: targetDate, $lte: endOfDay }, 
          timeSlot, 
          status: { $nin: ['completed', 'cancelled'] } 
        },
        { $set: { status: 'cancelled' } }
      );
    }

    const session = await DailySession.findOneAndUpdate(
      { doctor: req.user._id, date: targetDate, timeSlot },
      { status: newStatus },
      { new: true, upsert: true }
    );

    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get doctor analytics/reports data
// @route   GET /api/doctor/analytics
// @access  Private (Doctor only)
export const getDoctorAnalytics = async (req, res) => {
  try {
    const doctorId = req.user._id;

    // 1. Total Unique Patients
    const uniquePatients = await Appointment.distinct('patient', { doctor: doctorId, status: 'completed' });
    const totalPatients = uniquePatients.length;

    // 2. This Month's Completed Appointments
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const thisMonthAppts = await Appointment.countDocuments({
      doctor: doctorId,
      date: { $gte: startOfMonth, $lte: endOfMonth },
      status: 'completed'
    });

    // 3. Avg Rating (Mock for now, or derived)
    const avgRating = "4.8";

    // 4. Hours Worked (Derived from completed sessions)
    const completedSessions = await DailySession.countDocuments({ doctor: doctorId, status: 'ended' });
    const hoursWorked = completedSessions * 2; // Rough estimate of 2 hrs per session

    // 5. Weekly Patients (Last 7 days)
    const weeklyData = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
      
      const count = await Appointment.countDocuments({
        doctor: doctorId,
        date: { $gte: startOfDay, $lte: endOfDay },
        status: 'completed'
      });
      
      weeklyData.push({
        day: dayNames[d.getDay()],
        count,
        max: 10
      });
    }
    
    // Normalize weekly max
    const overallMax = Math.max(...weeklyData.map(w => w.count), 10);
    weeklyData.forEach(w => w.max = overallMax);

    // 6. Top Conditions Treated
    const allCompletedAppts = await Appointment.find({ doctor: doctorId, status: 'completed' }).select('symptoms');
    const symptomCounts = {};
    let totalSymptoms = 0;
    
    allCompletedAppts.forEach(app => {
      if (app.symptoms) {
        const sym = app.symptoms.trim();
        symptomCounts[sym] = (symptomCounts[sym] || 0) + 1;
        totalSymptoms++;
      }
    });

    let topConditions = Object.keys(symptomCounts).map(sym => ({
      name: sym.substring(0, 25), // prevent too long names
      count: symptomCounts[sym],
      pct: Math.round((symptomCounts[sym] / totalSymptoms) * 100)
    })).sort((a, b) => b.count - a.count).slice(0, 4);

    if (topConditions.length === 0) {
      topConditions = [
        { name: 'General Consultations', count: 0, pct: 0 },
      ];
    }

    res.json({
      success: true,
      data: {
        stats: {
          totalPatients: totalPatients.toString(),
          thisMonth: thisMonthAppts.toString(),
          avgRating,
          hoursWorked: `${hoursWorked}h`
        },
        weekly: weeklyData,
        topConditions
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Upload doctor avatar
// @route   POST /api/doctor/profile/upload-avatar
// @access  Private (Doctor only)
export const uploadDoctorAvatar = async (req, res) => {
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
 
