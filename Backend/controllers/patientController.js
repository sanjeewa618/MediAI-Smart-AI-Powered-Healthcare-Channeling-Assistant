import mongoose from 'mongoose';
import User from '../model/User.js';
import Appointment from '../model/Appointment.js';
import LabTest from '../model/LabTest.js';
import LabBooking from '../model/LabBooking.js';
import MedicalRecord from '../model/MedicalRecord.js';
import PDFDocument from 'pdfkit';

// Helper: builds a live queue snapshot for a list of appointments.
// For each appointment, the queue snapshot contains:
//   - the patient's own queue number
//   - the number of patients currently being served (or already finished) ahead of them
//   - the total number of patients in the same slot on that day
//   - the currently-being-served queue number for the doctor's slot
//   - a derived estimated wait time in minutes
const buildQueueSnapshots = async (appointments) => {
  const snapshots = [];
  for (const appt of appointments) {
    const apptDate = new Date(appt.date);
    const startOfDay = new Date(apptDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(apptDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Total active (non-cancelled) patients in the same doctor + time slot + day
    const totalInSlot = await Appointment.countDocuments({
      doctor: appt.doctor._id ?? appt.doctor,
      timeSlot: appt.timeSlot,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    });

    // Find the patient currently 'in', or fallback to the lowest queue number pending/confirmed.
    let currentlyServing = await Appointment.findOne({
      doctor: appt.doctor._id ?? appt.doctor,
      timeSlot: appt.timeSlot,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: 'in'
    }).select('queueNumber');

    if (!currentlyServing) {
      currentlyServing = await Appointment.findOne({
        doctor: appt.doctor._id ?? appt.doctor,
        timeSlot: appt.timeSlot,
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ['ready', 'nextIn', 'started', 'pending', 'confirmed'] }
      })
        .sort({ queueNumber: 1 })
        .select('queueNumber');
    }

    // How many patients are ahead of THIS patient (lower queue numbers,
    // excluding cancelled). If currentlyServing is 5 and the patient is 7,
    // they have 2 people ahead.
    const ahead = Math.max(0, (appt.queueNumber || 1) - (currentlyServing?.queueNumber || 1));

    // Rough estimate: 10 minutes per patient ahead (configurable heuristic).
    const estimatedWaitMinutes = ahead * 10;

    snapshots.push({
      appointmentId: appt._id,
      queueNumber: appt.queueNumber || 1,
      totalInSlot,
      patientsAhead: ahead,
      currentlyServing: currentlyServing?.queueNumber || 1,
      estimatedWaitMinutes
    });
  }
  return snapshots;
};

const buildLabQueueSnapshots = async (bookings) => {
  const snapshots = [];
  for (const booking of bookings) {
    const bookingDate = new Date(booking.appointmentDate || booking.date);
    const startOfDay = new Date(bookingDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

    const labId = booking.lab?._id || booking.lab;
    const slotId = booking.scheduleSlot?._id || booking.scheduleSlot;

    if (!labId || !slotId) continue;

    // Total active (non-cancelled) bookings in the same lab + scheduleSlot + day
    const totalInSlot = await LabBooking.countDocuments({
      lab: labId,
      scheduleSlot: slotId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'Cancelled' }
    });

    // Find the lowest queue token that is still in 'Pending' or 'Confirmed' or 'Checked-In'
    let currentlyServing = await LabBooking.findOne({
      lab: labId,
      scheduleSlot: slotId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: 'In-Progress'
    }).select('queueToken');

    if (!currentlyServing) {
      currentlyServing = await LabBooking.findOne({
        lab: labId,
        scheduleSlot: slotId,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ['Checked-In', 'Pending', 'Confirmed'] }
      })
        .sort({ queueToken: 1 })
        .select('queueToken');
    }

    const ahead = Math.max(0, (booking.queueToken || 1) - (currentlyServing?.queueToken || 1));
    const estimatedWaitMinutes = ahead * 10;

    snapshots.push({
      appointmentId: booking._id,
      queueNumber: booking.queueToken || 1,
      totalInSlot,
      patientsAhead: ahead,
      currentlyServing: currentlyServing?.queueToken || 1,
      estimatedWaitMinutes
    });
  }
  return snapshots;
};

const isAppointmentExpired = (apptDate, timeSlotStr) => {
  if (!apptDate) return true;
  if (!timeSlotStr) return false;

  try {
    let timePart = timeSlotStr;
    if (timeSlotStr.includes('-')) {
      timePart = timeSlotStr.split('-')[1].trim();
    }

    let hours = 0;
    let minutes = 0;
    const match = timePart.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (match) {
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
      const ampm = match[3].toUpperCase();
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
    } else {
      const match24 = timePart.match(/(\d{1,2}):(\d{2})/);
      if (match24) {
        hours = parseInt(match24[1], 10);
        minutes = parseInt(match24[2], 10);
      }
    }

    const slOffset = 5.5 * 60 * 60 * 1000;
    const baseDate = new Date(apptDate);
    baseDate.setUTCHours(0, 0, 0, 0);

    const localTimeMs = baseDate.getTime() + (hours * 60 + minutes) * 60 * 1000;
    const slotEndUtc = new Date(localTimeMs - slOffset);

    return new Date() > slotEndUtc;
  } catch (err) {
    console.error('Error in isAppointmentExpired:', err);
    return false;
  }
};

// @desc    Get patient dashboard summary (Upcoming appointments & lab tests)
// @route   GET /api/patient/dashboard
// @access  Private (Patient only)
export const getDashboardData = async (req, res) => {
  try {
    const now = new Date();
    const slOffset = 5.5 * 60 * 60 * 1000;
    const localTime = new Date(now.getTime() + slOffset);
    localTime.setUTCHours(0, 0, 0, 0);
    const todayLocal = new Date(localTime.getTime() - slOffset);
    const todayUtc = new Date();
    todayUtc.setHours(0, 0, 0, 0);
    const today = todayLocal < todayUtc ? todayLocal : todayUtc;

    // 1. Fetch upcoming doctor appointments (Populating doctor details for the UI)
    const rawDoctorAppointments = await Appointment.find({
      patient: req.user._id,
      date: { $gte: today },
      status: { $in: ['pending', 'confirmed', 'started', 'ready', 'in', 'skipped', 'nextIn'] }
    })
      .populate('doctor', 'name specialization hospital photo')
      .sort({ date: 1, timeSlot: 1 })
      .limit(10);

    const doctorAppointments = rawDoctorAppointments.slice(0, 5);

    // 2. Fetch upcoming lab tests from LabBooking
    const rawLabBookings = await LabBooking.find({
      patientUser: req.user._id,
      appointmentDate: { $gte: today },
      status: { $in: ['Pending', 'Confirmed', 'Checked-In', 'Sample-Collected', 'Testing'] }
    })
      .populate('lab', 'name floor description')
      .populate('scheduleSlot', 'startTime endTime room nurse')
      .sort({ appointmentDate: 1 })
      .limit(10);

    const activeLabBookings = rawLabBookings;

    const labAppointments = activeLabBookings.slice(0, 5).map(booking => ({
      _id: booking._id,
      testName: booking.lab?.name || 'Lab Test',
      date: booking.appointmentDate,
      timeSlot: booking.scheduleSlot && booking.scheduleSlot.startTime && booking.scheduleSlot.endTime 
        ? `${booking.scheduleSlot.startTime} - ${booking.scheduleSlot.endTime}` 
        : (booking.scheduleSlot?.startTime || '09:00 AM'),
      queueNumber: booking.queueToken,
      status: booking.status,
      collectionMethod: booking.collectionMethod,
      paymentStatus: booking.paymentStatus,
      room: booking.scheduleSlot?.room || 'Room 01'
    }));

    // 3. Build live queue snapshots for the upcoming doctor appointments and lab bookings.
    const doctorQueue = await buildQueueSnapshots(doctorAppointments);
    const labQueue = await buildLabQueueSnapshots(activeLabBookings);
    const liveQueue = [...doctorQueue, ...labQueue];

    // 4. Fetch counts for today's completed and cancelled doctor appointments + lab appointments
    const endOfToday = new Date(today.getTime());
    endOfToday.setHours(23, 59, 59, 999);

    const todayCompletedDoctorCount = await Appointment.countDocuments({
      patient: req.user._id,
      date: { $gte: today, $lte: endOfToday },
      status: 'completed'
    });
    
    const todayCancelledDoctorCount = await Appointment.countDocuments({
      patient: req.user._id,
      date: { $gte: today, $lte: endOfToday },
      status: 'cancelled'
    });

    const todayCompletedLabCount = await LabBooking.countDocuments({
      patientUser: req.user._id,
      appointmentDate: { $gte: today, $lte: endOfToday },
      status: 'Completed'
    });

    const todayCancelledLabCount = await LabBooking.countDocuments({
      patientUser: req.user._id,
      appointmentDate: { $gte: today, $lte: endOfToday },
      status: 'Cancelled'
    });

    const todayCompletedCount = todayCompletedDoctorCount + todayCompletedLabCount;
    const todayCancelledCount = todayCancelledDoctorCount + todayCancelledLabCount;

    res.json({
      success: true,
      data: {
        doctorAppointments,
        labAppointments,
        liveQueue,
        todayCompletedCount,
        todayCancelledCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get live queue status for a specific appointment
// @route   GET /api/patient/queue/:appointmentId
// @access  Private (Patient only)
export const getLiveQueueStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.appointmentId,
      patient: req.user._id
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const [snapshot] = await buildQueueSnapshots([appointment]);

    res.json({
      success: true,
      data: snapshot
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
      user.nic = req.body.nic || user.nic;
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
          nic: updatedUser.nic,
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

// @desc    Upload patient avatar/profile picture
// @route   POST /api/patient/profile/upload-avatar
// @access  Private (Patient only)
export const uploadPatientAvatar = async (req, res) => {
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

// @desc    Get patient completed appointments (Doctor/Lab) for report summary
// @route   GET /api/patient/completed-appointments
// @access  Private (Patient only)
export const getCompletedAppointments = async (req, res) => {
  try {
    const doctorAppts = await Appointment.find({
      patient: req.user._id,
      status: 'completed'
    }).populate('doctor', 'name specialization hospital photo');

    const labAppts = await LabBooking.find({
      patientUser: req.user._id,
      status: 'Completed'
    }).populate('lab', 'name floor description');

    res.json({
      success: true,
      data: {
        doctorAppointments: doctorAppts,
        labAppointments: labAppts
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Generate PDF report summary for completed doctor appointment or lab booking
// @route   GET /api/patient/reports/generate-pdf/:type/:id
// @access  Private (Patient only)
export const generateAppointmentPdf = async (req, res) => {
  try {
    const { type, id } = req.params;
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    
    // Set headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=summary_${type}_${id}.pdf`);
    
    doc.pipe(res);

    if (type === 'doctor') {
      const appt = await Appointment.findById(id).populate('doctor', 'name specialization hospital photo');
      if (!appt || appt.patient.toString() !== req.user._id.toString()) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      // PDF Content Design
      doc.fontSize(22).fillColor('#8B3DFF').text('MediAI Channeling Summary', { align: 'center' });
      doc.moveDown(1.5);

      doc.fontSize(14).fillColor('#111827').text('Patient Details', { underline: true });
      doc.fontSize(11).fillColor('#4B5563').text(`Name: ${req.user.name}`);
      doc.text(`Email: ${req.user.email}`);
      doc.text(`Contact: ${req.user.phone || 'N/A'}`);
      doc.moveDown(1);

      doc.fontSize(14).fillColor('#111827').text('Appointment Details', { underline: true });
      doc.fontSize(11).fillColor('#4B5563').text(`Doctor: ${appt.doctor.name}`);
      doc.text(`Specialization: ${appt.doctor.specialization}`);
      doc.text(`Hospital: ${appt.doctor.hospital || 'MediAI Hospital'}`);
      doc.text(`Date: ${new Date(appt.date).toLocaleDateString()}`);
      doc.text(`Time Slot: ${appt.timeSlot}`);
      doc.text(`Queue Number: #${appt.queueNumber}`);
      doc.text(`Status: Completed`);
      doc.moveDown(1);

      doc.fontSize(14).fillColor('#111827').text("Doctor's Notes & Recommendations", { underline: true });
      doc.fontSize(11).fillColor('#111827').text(appt.notes || 'No notes added by doctor.');
      doc.moveDown(2);

      doc.fontSize(9).fillColor('#9CA3AF').text('Generated by MediAI Smart Channeling Assistant', { align: 'center' });

    } else if (type === 'lab') {
      const booking = await LabBooking.findById(id).populate('lab', 'name floor description');
      if (!booking || booking.patientUser.toString() !== req.user._id.toString()) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      doc.fontSize(22).fillColor('#0EA5E9').text('MediAI Laboratory Summary', { align: 'center' });
      doc.moveDown(1.5);

      doc.fontSize(14).fillColor('#111827').text('Patient Details', { underline: true });
      doc.fontSize(11).fillColor('#4B5563').text(`Name: ${req.user.name}`);
      doc.text(`Email: ${req.user.email}`);
      doc.text(`Contact: ${req.user.phone || 'N/A'}`);
      doc.moveDown(1);

      doc.fontSize(14).fillColor('#111827').text('Test Details', { underline: true });
      doc.fontSize(11).fillColor('#4B5563').text(`Laboratory: ${booking.lab?.name || 'MediAI Lab'}`);
      doc.text(`Floor: ${booking.lab?.floor || '1st Floor'}`);
      doc.text(`Date: ${new Date(booking.appointmentDate).toLocaleDateString()}`);
      doc.text(`Queue Token: #${booking.queueToken}`);
      doc.text(`Collection Method: ${booking.collectionMethod}`);
      doc.text(`Payment Status: ${booking.paymentStatus}`);
      doc.text(`Status: Completed`);
      doc.moveDown(1.5);

      doc.fontSize(9).fillColor('#9CA3AF').text('Generated by MediAI Smart Channeling Assistant', { align: 'center' });
    } else {
      return res.status(400).json({ message: 'Invalid summary type' });
    }

    doc.end();
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Request admin to set skipped appointment to nextIn
// @route   PUT /api/patient/request-next-in/:appointmentId
// @access  Private (Patient only)
export const requestAdminNextIn = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.appointmentId,
      patient: req.user._id
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.status !== 'skipped') {
      return res.status(400).json({ success: false, message: 'Only skipped appointments can be requested' });
    }

    appointment.status = 'nextIn';
    await appointment.save();

    res.json({
      success: true,
      message: 'Request sent to admin successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Error requesting nextIn:', error);
    res.status(500).json({ success: false, message: 'Server error while requesting next in' });
  }
};
