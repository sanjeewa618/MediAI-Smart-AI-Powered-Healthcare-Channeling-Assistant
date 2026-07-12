import mongoose from 'mongoose';
import User from '../model/User.js';
import Appointment from '../model/Appointment.js';
import DoctorAvailability from '../model/DoctorAvailability.js';
import Specialty from '../model/Specialty.js';

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
    const filter = { role: 'doctor', status: 'approved' };
    
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

    const targetDate = new Date();
    const targetMonth = month !== undefined ? parseInt(month) : targetDate.getMonth();
    const targetYear = year !== undefined ? parseInt(year) : targetDate.getFullYear();

    // 1. Get doctor's availability template
    const slots = await DoctorAvailability.find({ doctor: doctorId });

    // 2. Find start and end of the month
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0);

    // 3. Fetch all active appointments for this doctor in this month
    const appointments = await Appointment.find({
      doctor: doctorId,
      date: { $gte: startDate, $lte: endDate },
      status: { $in: ['pending', 'confirmed'] }
    });

    // Group appointments by date string (YYYY-MM-DD) and timeSlot so we
    // can compute the per-slot queue number. Queue numbers are per
    // doctor, per date, per time slot, and reset daily.
    const appointmentCounts = {};
    appointments.forEach(app => {
      const dateStr = new Date(app.date).toISOString().split('T')[0];
      const key = `${dateStr}_${app.timeSlot}`;
      appointmentCounts[key] = (appointmentCounts[key] || 0) + 1;
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
        const bookedCount = appointmentCounts[key] || 0;
        const maxPatients = s.maxPatients || 1;
        // The next queue number for this slot = bookedCount + 1, but
        // never more than maxPatients. When the slot is full, show
        // maxPatients so the UI displays a sensible value.
        const nextQueueNumber = bookedCount >= maxPatients
          ? maxPatients
          : bookedCount + 1;

        return {
          id: s._id,
          startTime: s.startTime,
          endTime: s.endTime,
          timeSlot: timeSlotStr,
          maxPatients,
          bookedCount,
          isFull: bookedCount >= maxPatients,
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
