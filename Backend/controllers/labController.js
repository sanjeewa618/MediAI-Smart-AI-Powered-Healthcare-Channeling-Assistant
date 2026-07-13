import mongoose from 'mongoose';

import Lab from '../model/Lab.js';
import LabCategory from '../model/LabCategory.js';
import LabBooking from '../model/LabBooking.js';
import LabSchedule from '../model/LabSchedule.js';
import LabReport from '../model/LabReport.js';
import User from '../model/User.js';
import Notification from '../model/Notification.js';

const getUTCDateRange = (dateInput) => {
  let dateStr = '';
  if (dateInput instanceof Date) {
    dateStr = dateInput.toISOString().split('T')[0];
  } else if (typeof dateInput === 'string') {
    dateStr = dateInput.split('T')[0];
  } else {
    dateStr = new Date().toISOString().split('T')[0];
  }
  
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  
  const start = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
  return { start, end };
};

const isSlotExpired = (slotDate, endTimeStr) => {
  let hours = 0;
  let minutes = 0;
  
  const match = endTimeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (match) {
    hours = parseInt(match[1], 10);
    minutes = parseInt(match[2], 10);
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
  } else {
    const match24 = endTimeStr.match(/(\d{1,2}):(\d{2})/);
    if (match24) {
      hours = parseInt(match24[1], 10);
      minutes = parseInt(match24[2], 10);
    }
  }
  
  const offset = 5.5; // Sri Lanka Time (GMT+5:30)
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const localNow = new Date(utc + (3600000 * offset));
  
  const slotDateLocal = new Date(slotDate);
  const year = slotDateLocal.getUTCFullYear();
  const month = slotDateLocal.getUTCMonth();
  const day = slotDateLocal.getUTCDate();
  
  const slotEndLocal = new Date(year, month, day, hours, minutes);
  
  return localNow.getTime() > slotEndLocal.getTime();
};

const generateBookingRef = async () => {
  const year = new Date().getFullYear();
  const count = await LabBooking.countDocuments();
  const seq = String(count + 1).padStart(4, '0');
  return `MED-LAB-${year}-${seq}`;
};

const generateQueueToken = async (labId, date) => {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(normalizedDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const count = await LabBooking.countDocuments({
    lab: labId,
    appointmentDate: { $gte: normalizedDate, $lt: nextDay },
    status: { $in: ['Pending', 'Confirmed', 'Checked-In'] },
  });
  return count + 1;
};

const getCategories = async (req, res, next) => {
  try {
    let categories = await LabCategory.find({ isActive: true }).sort({ order: 1 });
    if (categories.length === 0) {
      const defaultCategories = [
        { name: 'Blood Test', icon: '🩸', color: '#FEE2E2', order: 1 },
        { name: 'Urine Test', icon: '🧪', color: '#FEF3C7', order: 2 },
        { name: 'Diabetes', icon: '🍬', color: '#E0F2FE', order: 3 },
        { name: 'Heart', icon: '❤️', color: '#FCE7F3', order: 4 },
        { name: 'Liver', icon: '🧬', color: '#FDF2F8', order: 5 },
        { name: 'Pregnancy', icon: '🤰', color: '#FFF1F2', order: 6 }
      ];
      await LabCategory.insertMany(defaultCategories);
      categories = await LabCategory.find({ isActive: true }).sort({ order: 1 });
    }
    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};

const getLabs = async (req, res, next) => {
  try {
    const { category, search, status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (category) {
      if (!mongoose.isValidObjectId(category)) {
        return res.status(400).json({ success: false, message: 'Invalid category id' });
      }
      filter.category = category;
    }

    if (status) {
      const validStatuses = ['Available', 'Busy', 'Overloaded', 'Closed', 'Maintenance'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: `status must be one of: ${validStatuses.join(', ')}` });
      }
      filter.status = status;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ name: regex }, { description: regex }];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const allLabs = await Lab.find(filter)
      .populate('category', 'name icon color')
      .populate('assignedNurse', 'name photo shift department status')
      .sort({ createdAt: -1 });

    // Self-correct category reference in MongoDB if missing
    for (let lab of allLabs) {
      if (!lab.category && lab.assignedNurse) {
        const dept = lab.assignedNurse.department || (lab.name && lab.name.split(' ')[0]);
        if (dept) {
          const matchedCat = await LabCategory.findOne({ name: new RegExp(`^${dept}$`, 'i') });
          if (matchedCat) {
            await Lab.updateOne({ _id: lab._id }, { category: matchedCat._id });
            lab.category = matchedCat;
          }
        }
      }
    }

    // Filter to display only labs associated with approved/active/verified/pending signed-up hospital nurses
    const activeUserStatuses = ['pending', 'approved', 'active', 'verified'];
    const labs = allLabs.filter(lab => {
      if (!lab.assignedNurse) return false; // Filter out system/seed labs with no nurse
      const nurseStatus = String(lab.assignedNurse.status || '').toLowerCase();
      return activeUserStatuses.includes(nurseStatus);
    });

    const finalTotal = labs.length;
    const skip = (pageNum - 1) * pageSize;
    const paginatedLabs = labs.slice(skip, skip + pageSize);

    // Group active slot counts by lab
    const labIds = paginatedLabs.map(l => l._id);
    const schedules = await LabSchedule.find({ lab: { $in: labIds } });
    const slotCountsMap = {};
    schedules.forEach(sched => {
      const idStr = sched.lab.toString();
      slotCountsMap[idStr] = (slotCountsMap[idStr] || 0) + 1;
    });

    const populatedLabs = paginatedLabs.map(l => {
      const obj = l.toObject();
      obj.slotsCount = slotCountsMap[obj._id.toString()] || 0;
      return obj;
    });

    res.status(200).json({
      success: true,
      data: populatedLabs,
      meta: {
        total: finalTotal,
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(finalTotal / pageSize),
      },
    });
  } catch (err) {
    next(err);
  }
};

const updateLabStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid lab id' });
    }

    if (!['Available', 'Busy', 'Overloaded', 'Closed', 'Maintenance'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'status must be one of: Available, Busy, Overloaded, Closed, Maintenance',
      });
    }

    const lab = await Lab.findById(id);
    if (!lab) {
      return res.status(404).json({ success: false, message: 'Lab not found' });
    }

    lab.status = status;
    const updatedLab = await lab.save();

    res.status(200).json({ success: true, data: updatedLab });
  } catch (err) {
    next(err);
  }
};

const getLabById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid lab id' });
    }

    const lab = await Lab.findById(id)
      .populate('category', 'name icon color')
      .populate('assignedNurse', 'name photo shift phone department');

    if (!lab) {
      return res.status(404).json({ success: false, message: 'Lab not found' });
    }

    res.status(200).json({ success: true, data: lab });
  } catch (err) {
    next(err);
  }
};

const getLabAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid lab id' });
    }

    const lab = await Lab.findById(id);
    if (!lab) {
      return res.status(404).json({ success: false, message: 'Lab not found' });
    }

    let dayStart, dayEnd;
    if (date) {
      const range = getUTCDateRange(date);
      dayStart = range.start;
      dayEnd = range.end;
    } else {
      const todayStr = new Date().toISOString().split('T')[0];
      const range = getUTCDateRange(todayStr);
      dayStart = range.start;
    }

    const query = {
      lab: id,
      isActive: true,
    };
    if (dayStart && dayEnd) {
      query.date = { $gte: dayStart, $lte: dayEnd };
    } else if (dayStart) {
      query.date = { $gte: dayStart };
    }

    const scheduleSlots = await LabSchedule.find(query).sort({ date: 1, startTime: 1 });

    const slotsWithOccupancy = await Promise.all(
      scheduleSlots.map(async (slot) => {
        const booked = await LabBooking.countDocuments({
          lab: id,
          scheduleSlot: slot._id,
          status: { $in: ['Pending', 'Confirmed', 'Checked-In'] },
        });

        const remaining = slot.maxPatients - booked;
        let slotStatus = 'Available';
        if (remaining <= 0) slotStatus = 'Full';
        else if (remaining <= Math.ceil(slot.maxPatients * 0.2)) slotStatus = 'Busy';

        const isExpired = isSlotExpired(slot.date, slot.endTime);
        if (isExpired) {
          slotStatus = 'Closed';
        }

        return {
          slotId: slot._id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          maxPatients: slot.maxPatients,
          booked,
          remaining: Math.max(0, remaining),
          status: slotStatus,
          room: slot.room,
          nurse: slot.nurse,
          isExpired,
        };
      })
    );

    const count = await LabBooking.countDocuments({
      lab: id,
      appointmentDate: { $gte: dayStart, $lte: dayEnd },
      status: { $in: ['Pending', 'Confirmed', 'Checked-In'] },
    });
    const currentToken = count + 1;

    res.status(200).json({
      success: true,
      data: {
        lab: { _id: lab._id, name: lab.name, floor: lab.floor, openTime: lab.openTime, closeTime: lab.closeTime },
        date,
        currentToken,
        slots: slotsWithOccupancy,
      },
    });
  } catch (err) {
    next(err);
  }
};

const createBooking = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      labId,
      scheduleSlotId,
      appointmentDate,
      patient,
      collectionMethod,
      homeAddress,
      paymentMethod,
      referralImageUrl,
    } = req.body;

    const requiredFields = { labId, appointmentDate };
    for (const [key, val] of Object.entries(requiredFields)) {
      if (!val) {
        await session.abortTransaction();
        return res.status(400).json({ success: false, message: `${key} is required` });
      }
    }

    const patientRequired = ['fullName', 'nic', 'gender', 'mobile'];
    for (const field of patientRequired) {
      if (!patient?.[field]) {
        await session.abortTransaction();
        return res.status(400).json({ success: false, message: `patient.${field} is required` });
      }
    }

    if (!['Hospital', 'Home'].includes(collectionMethod)) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'collectionMethod must be Hospital or Home' });
    }

    if (collectionMethod === 'Home' && !homeAddress) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'homeAddress is required for Home collection' });
    }

    if (!['Card', 'Cash'].includes(paymentMethod)) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'paymentMethod must be Card or Cash' });
    }

    if (!mongoose.isValidObjectId(labId)) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'Invalid labId' });
    }

    let lab = await Lab.findById(labId).session(session);
    if (!lab) {
      lab = await Lab.findOne({ assignedNurse: labId }).session(session);
    }
    if (!lab) {
      lab = await Lab.findOne({}).session(session);
    }

    if (!lab) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: 'Lab not found' });
    }

    let slot;
    if (scheduleSlotId && mongoose.isValidObjectId(scheduleSlotId)) {
      slot = await LabSchedule.findById(scheduleSlotId).session(session);
    }

    if (!slot) {
      const startTime = req.body.timeSlot || '09:00 AM';
      const endTime = req.body.endTime || '10:00 AM';
      const { start: apptDate, end: apptDateEnd } = getUTCDateRange(appointmentDate);

      slot = await LabSchedule.findOne({
        lab: lab._id,
        date: { $gte: apptDate, $lte: apptDateEnd },
        startTime,
      }).session(session);

      if (!slot) {
        slot = new LabSchedule({
          lab: lab._id,
          date: apptDate,
          startTime,
          endTime,
          maxPatients: 20,
          nurse: lab.assignedNurse ? (await User.findById(lab.assignedNurse))?.name || 'Nurse' : 'Nurse',
          room: 'Room 01',
          type: lab.name,
        });
        await slot.save({ session });
      }
    }

    const { start: slotDate, end: slotDateEnd } = getUTCDateRange(appointmentDate);

    const currentBooked = await LabBooking.countDocuments({
      lab: lab._id,
      scheduleSlot: slot._id,
      status: { $in: ['Pending', 'Confirmed', 'Checked-In'] },
    }).session(session);

    if (currentBooked >= slot.maxPatients) {
      await session.abortTransaction();
      return res.status(409).json({ success: false, message: 'This time slot is fully booked' });
    }

    const bookingRef = await generateBookingRef();
    const queueToken = await generateQueueToken(lab._id, appointmentDate);

    const [booking] = await LabBooking.create(
      [
        {
          bookingRef,
          lab: lab._id,
          scheduleSlot: slot._id,
          patientUser: req.user._id,
          appointmentDate: slotDate,
          patient,
          collectionMethod,
          homeAddress: collectionMethod === 'Home' ? homeAddress : undefined,
          paymentMethod,
          paymentStatus: paymentMethod === 'Card' ? 'Paid' : 'Pending',
          referralImageUrl: referralImageUrl || null,
          queueToken,
          status: 'Pending',
        },
      ],
      { session }
    );

    await session.commitTransaction();

    await booking.populate([
      { path: 'lab', select: 'name floor openTime closeTime' },
      { path: 'scheduleSlot', select: 'startTime endTime room nurse' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Booking confirmed',
      data: {
        bookingRef: booking.bookingRef,
        queueToken: booking.queueToken,
        status: booking.status,
        appointmentDate: booking.appointmentDate,
        lab: booking.lab,
        scheduleSlot: booking.scheduleSlot,
        collectionMethod: booking.collectionMethod,
        paymentStatus: booking.paymentStatus,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

const getBookingByRef = async (req, res, next) => {
  try {
    const { bookingRef } = req.params;

    const booking = await LabBooking.findOne({ bookingRef })
      .populate('lab', 'name floor openTime closeTime')
      .populate('scheduleSlot', 'startTime endTime room nurse');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const dayStart = new Date(booking.appointmentDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(booking.appointmentDate);
    dayEnd.setHours(23, 59, 59, 999);

    const currentToken = await LabBooking.countDocuments({
      lab: booking.lab._id,
      appointmentDate: { $gte: dayStart, $lte: dayEnd },
      status: 'Checked-In',
    });

    const aheadInQueue = Math.max(0, booking.queueToken - currentToken - 1);

    res.status(200).json({
      success: true,
      data: {
        ...booking.toObject(),
        queueInfo: {
          currentToken,
          yourToken: booking.queueToken,
          aheadInQueue,
          estimatedWaitMinutes: aheadInQueue * 5,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

const listBookings = async (req, res, next) => {
  try {
    const { labId, status, date, patientName, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (req.user && req.user.role === 'patient') {
      filter.patientUser = req.user._id;
    } else if (labId) {
      if (!mongoose.isValidObjectId(labId)) {
        return res.status(400).json({ success: false, message: 'Invalid labId' });
      }
      filter.lab = labId;
    } else if (req.user && req.user.role === 'nurse') {
      const category = await LabCategory.findOne({ name: { $regex: new RegExp(`^${req.user.department}`, 'i') } });
      if (category) {
        const labs = await Lab.find({ category: category._id });
        filter.lab = { $in: labs.map(l => l._id) };
      } else {
        filter.lab = new mongoose.Types.ObjectId();
      }
    }

    if (status && status !== 'all') {
      const statusLower = status.toLowerCase();
      if (statusLower === 'today' || statusLower === 'activein') {
        filter.status = { $in: ['Confirmed', 'Checked-In', 'Sample-Collected', 'Testing'] };
      } else {
        const validStatuses = ['Pending', 'Confirmed', 'Checked-In', 'Sample-Collected', 'Testing', 'Completed', 'Cancelled'];
        const matchedStatus = validStatuses.find(s => s.toLowerCase() === statusLower);
        if (matchedStatus) {
          filter.status = matchedStatus;
        }
      }
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { 'patient.fullName': searchRegex },
        { bookingRef: searchRegex }
      ];
    }

    if (date) {
      const slOffset = 5.5 * 60 * 60 * 1000;
      const startLocal = new Date(`${date}T00:00:00.000Z`);
      const dayStart = new Date(startLocal.getTime() - slOffset);
      const endLocal = new Date(`${date}T23:59:59.999Z`);
      const dayEnd = new Date(endLocal.getTime() - slOffset);
      
      const dayEndUtc = new Date(endLocal.getTime());
      const maxDayEnd = dayEndUtc > dayEnd ? dayEndUtc : dayEnd;
      
      filter.appointmentDate = { $gte: dayStart, $lte: maxDayEnd };
    }

    if (patientName) {
      filter['patient.fullName'] = new RegExp(patientName, 'i');
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * pageSize;

    const [bookings, total] = await Promise.all([
      LabBooking.find(filter)
        .populate('lab', 'name floor')
        .populate('scheduleSlot', 'startTime endTime room nurse')
        .sort({ appointmentDate: 1, queueToken: 1 })
        .skip(skip)
        .limit(pageSize),
      LabBooking.countDocuments(filter),
    ]);

    let globalStats = null;
    if (req.user && req.user.role === 'admin') {
      const allBookings = await LabBooking.find({});
      globalStats = {
        cancelled: allBookings.filter(b => b.status === 'Cancelled').length,
        pending: allBookings.filter(b => b.status === 'Pending').length,
        completed: allBookings.filter(b => b.status === 'Completed').length,
      };
    }

    res.status(200).json({
      success: true,
      data: bookings,
      meta: { total, page: pageNum, limit: pageSize, totalPages: Math.ceil(total / pageSize) },
      stats: globalStats
    });
  } catch (err) {
    next(err);
  }
};

const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid booking id' });
    }

    const validStatuses = ['Confirmed', 'Checked-In', 'Sample-Collected', 'Testing', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `status must be one of: ${validStatuses.join(', ')}` });
    }

    const booking = await LabBooking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (['Completed', 'Cancelled'].includes(booking.status)) {
      return res.status(409).json({
        success: false,
        message: `Cannot change status of a ${booking.status} booking`,
      });
    }

    booking.status = status;
    if (status === 'Completed') booking.completedAt = new Date();
    if (status === 'Checked-In') booking.checkedInAt = new Date();
    await booking.save();

    // Send notification to patient if user is found
    try {
      await booking.populate([
        { path: 'lab', select: 'name floor' },
        { path: 'scheduleSlot', select: 'startTime endTime room' }
      ]);

      const patientUser = await User.findOne({ 
        $or: [
          { nic: booking.patient.nic }, 
          { phone: booking.patient.mobile }
        ] 
      });
      if (patientUser) {
        const formattedDate = new Date(booking.appointmentDate).toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
        const timeSlot = booking.scheduleSlot && booking.scheduleSlot.startTime && booking.scheduleSlot.endTime
          ? `${booking.scheduleSlot.startTime} - ${booking.scheduleSlot.endTime}`
          : '10:00 AM - 12:00 PM';

        if (status === 'Confirmed') {
          await Notification.create({
            user: patientUser._id,
            title: 'Appointment Confirmed',
            message: `Your appointment is scheduled on ${formattedDate} at ${timeSlot}. Please be present. Thank you for choosing us!`,
            type: 'appointment',
            isRead: false
          });
        } else {
          await Notification.create({
            user: patientUser._id,
            title: `Lab Booking ${status}`,
            message: `Your lab booking (${booking.bookingRef}) has been updated to ${status.toLowerCase()}.`,
            type: 'appointment',
            isRead: false
          });
        }
      }
    } catch (notifErr) {
      console.error('Failed to create booking notification:', notifErr);
    }

    res.status(200).json({ success: true, message: `Booking status updated to ${status}`, data: booking });
  } catch (err) {
    next(err);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const { labId, date } = req.query;

    const targetDate = date ? new Date(date) : new Date();
    
    const slOffset = 5.5 * 60 * 60 * 1000;
    const startLocal = new Date(targetDate.getTime());
    startLocal.setHours(0, 0, 0, 0);
    const dayStart = new Date(startLocal.getTime());
    const endLocal = new Date(targetDate.getTime());
    endLocal.setHours(23, 59, 59, 999);
    const dayEnd = new Date(endLocal.getTime());

    const baseFilter = {};

    if (labId && mongoose.isValidObjectId(labId)) {
      baseFilter.lab = labId;
    } else if (req.user && req.user.role === 'nurse') {
      const category = await LabCategory.findOne({ name: { $regex: new RegExp(`^${req.user.department}`, 'i') } });
      if (category) {
        const labs = await Lab.find({ category: category._id });
        baseFilter.lab = { $in: labs.map(l => l._id) };
      } else {
        baseFilter.lab = new mongoose.Types.ObjectId();
      }
    } else {
      return res.status(400).json({ success: false, message: 'Valid labId is required' });
    }

    const todayFilter = { ...baseFilter, appointmentDate: { $gte: dayStart, $lte: dayEnd } };
    const activeFilter = { ...baseFilter, appointmentDate: { $gte: dayStart } }; // Today and future

    const [todayTotal, pending, processing, completed] = await Promise.all([
      LabBooking.countDocuments(todayFilter),
      LabBooking.countDocuments({ ...activeFilter, status: 'Pending' }),
      LabBooking.countDocuments({ ...activeFilter, status: { $in: ['Confirmed', 'Checked-In', 'Sample-Collected', 'Testing'] } }),
      LabBooking.countDocuments({ ...todayFilter, status: 'Completed' }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        todayTotal,
        pending,
        processing,
        completed,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getSchedule = async (req, res, next) => {
  try {
    const { labId } = req.params;
    const { date } = req.query;

    if (!mongoose.isValidObjectId(labId)) {
      return res.status(400).json({ success: false, message: 'Invalid labId' });
    }
    if (!date) {
      return res.status(400).json({ success: false, message: 'date query param is required' });
    }

    let resolvedLabId = labId;
    let lab = await Lab.findById(labId);
    if (!lab) {
      lab = await Lab.findOne({ assignedNurse: labId });
    }
    if (!lab) {
      const nurseUser = await User.findById(labId);
      // Try to find a matching LabCategory by the nurse's department so the lab is properly categorised
      let categoryId = null;
      if (nurseUser?.department) {
        const cat = await LabCategory.findOne({ name: new RegExp(`^${nurseUser.department}$`, 'i') });
        categoryId = cat?._id || null;
      }
      lab = new Lab({
        name: `${nurseUser?.department || 'General'} Lab`,
        floor: 'Main Floor',
        status: 'Available',
        assignedNurse: labId,
        ...(categoryId ? { category: categoryId } : {}),
      });
      await lab.save();
    }
    if (lab) {
      resolvedLabId = lab._id;
    }

    const { start: dayStart, end: dayEnd } = getUTCDateRange(date);

    const slots = await LabSchedule.find({
      lab: resolvedLabId,
      date: { $gte: dayStart, $lte: dayEnd },
    }).sort({ startTime: 1 });

    const enriched = await Promise.all(
      slots.map(async (slot) => {
        const booked = await LabBooking.countDocuments({
          lab: resolvedLabId,
          scheduleSlot: slot._id,
          status: { $in: ['Pending', 'Confirmed', 'Checked-In', 'Sample-Collected', 'Testing'] },
        });
        return { ...slot.toObject(), booked };
      })
    );

    res.status(200).json({ success: true, data: enriched });
  } catch (err) {
    next(err);
  }
};

const createScheduleSlot = async (req, res, next) => {
  try {
    const { labId } = req.params;
    const { date, startTime, endTime, maxPatients, nurse, room, type } = req.body;

    if (!mongoose.isValidObjectId(labId)) {
      return res.status(400).json({ success: false, message: 'Invalid labId' });
    }

    const required = { date, startTime, endTime, maxPatients, nurse, room, type };
    for (const [key, val] of Object.entries(required)) {
      if (val === undefined || val === null || val === '') {
        return res.status(400).json({ success: false, message: `${key} is required` });
      }
    }

    if (parseInt(maxPatients, 10) < 1) {
      return res.status(400).json({ success: false, message: 'maxPatients must be at least 1' });
    }

    let resolvedLabId = labId;
    let lab = await Lab.findById(labId);
    if (!lab) {
      lab = await Lab.findOne({ assignedNurse: labId });
    }
    if (!lab) {
      const nurseUser = await User.findById(labId);
      // Try to find a matching LabCategory so the lab appears under the right category for patients
      const departmentName = type || nurseUser?.department || 'General';
      let categoryId = null;
      const cat = await LabCategory.findOne({ name: new RegExp(`^${departmentName}$`, 'i') });
      categoryId = cat?._id || null;
      lab = new Lab({
        name: `${departmentName} Lab`,
        floor: 'Main Floor',
        status: 'Available',
        assignedNurse: labId,
        ...(categoryId ? { category: categoryId } : {}),
      });
      await lab.save();
    }
    if (lab) {
      resolvedLabId = lab._id;
    }

    const { start: slotDate } = getUTCDateRange(date);

    const slot = await LabSchedule.create({
      lab: resolvedLabId,
      date: slotDate,
      startTime,
      endTime,
      maxPatients: parseInt(maxPatients, 10),
      nurse,
      room,
      type,
      isActive: req.body.isActive !== false,
    });

    res.status(201).json({ success: true, data: slot });
  } catch (err) {
    next(err);
  }
};

const updateScheduleSlot = async (req, res, next) => {
  try {
    const { slotId } = req.params;

    if (!mongoose.isValidObjectId(slotId)) {
      return res.status(400).json({ success: false, message: 'Invalid slotId' });
    }

    const allowedUpdates = ['date', 'startTime', 'endTime', 'maxPatients', 'nurse', 'room', 'type', 'isActive'];
    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No updatable fields provided' });
    }

    const slot = await LabSchedule.findByIdAndUpdate(slotId, updates, { new: true, runValidators: true });
    if (!slot) return res.status(404).json({ success: false, message: 'Schedule slot not found' });

    res.status(200).json({ success: true, data: slot });
  } catch (err) {
    next(err);
  }
};

const deleteScheduleSlot = async (req, res, next) => {
  try {
    const { slotId } = req.params;

    if (!mongoose.isValidObjectId(slotId)) {
      return res.status(400).json({ success: false, message: 'Invalid slotId' });
    }

    const activeBookings = await LabBooking.countDocuments({
      scheduleSlot: slotId,
      status: { $in: ['Pending', 'Confirmed', 'Checked-In'] },
    });

    if (activeBookings > 0) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete slot with ${activeBookings} active booking(s). Cancel them first.`,
      });
    }

    const slot = await LabSchedule.findByIdAndDelete(slotId);
    if (!slot) return res.status(404).json({ success: false, message: 'Schedule slot not found' });

    res.status(200).json({ success: true, message: 'Schedule slot removed successfully' });
  } catch (err) {
    next(err);
  }
};

const listReports = async (req, res, next) => {
  try {
    const { labId, category, status, search, date, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (labId) {
      if (!mongoose.isValidObjectId(labId)) {
        return res.status(400).json({ success: false, message: 'Invalid labId' });
      }
      filter.lab = labId;
    } else if (req.user && req.user.role === 'nurse') {
      const cat = await LabCategory.findOne({ name: { $regex: new RegExp(`^${req.user.department}`, 'i') } });
      if (cat) {
        const labs = await Lab.find({ category: cat._id });
        filter.lab = { $in: labs.map(l => l._id) };
      } else {
        filter.lab = new mongoose.Types.ObjectId();
      }
    }

    if (category && category !== 'all') filter.category = new RegExp(category, 'i');
    if (status) filter.status = status;

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ 'patient.fullName': regex }, { testType: regex }, { refNo: regex }];
    }

    if (date) {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      filter.reportDate = { $gte: dayStart, $lte: dayEnd };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * pageSize;

    const [reports, total] = await Promise.all([
      LabReport.find(filter)
        .populate('lab', 'name floor')
        .populate('booking', 'bookingRef queueToken appointmentDate createdAt')
        .sort({ reportDate: -1 })
        .skip(skip)
        .limit(pageSize),
      LabReport.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: reports,
      meta: { total, page: pageNum, limit: pageSize, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (err) {
    next(err);
  }
};

const createReport = async (req, res, next) => {
  try {
    const { bookingId, labId, testType, category, result, status, nurse } = req.body;

    const required = { bookingId, labId, testType, category, result, status, nurse };
    for (const [key, val] of Object.entries(required)) {
      if (!val) return res.status(400).json({ success: false, message: `${key} is required` });
    }

    if (!mongoose.isValidObjectId(bookingId) || !mongoose.isValidObjectId(labId)) {
      return res.status(400).json({ success: false, message: 'Invalid bookingId or labId' });
    }

    const booking = await LabBooking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const count = await LabReport.countDocuments();
    const year = new Date().getFullYear();
    const refNo = `LAB-${year}-${String(count + 1).padStart(3, '0')}`;

    const report = await LabReport.create({
      refNo,
      booking: bookingId,
      lab: labId,
      patient: booking.patient,
      testType,
      category,
      result,
      status,
      nurse,
      reportDate: new Date(),
      notes: req.body.notes || null,
      reportUrl: req.body.reportUrl || null,
    });

    if (['Completed', 'Pending Review'].includes(status)) {
      await LabBooking.findByIdAndUpdate(bookingId, { status: 'Completed', completedAt: new Date() });
    }

    res.status(201).json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};

const updateReport = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid report id' });
    }

    const allowedUpdates = ['result', 'status', 'notes', 'reportUrl'];
    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No updatable fields provided' });
    }

    const report = await LabReport.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    res.status(200).json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};

const sendBookingReminder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await LabBooking.findById(id)
      .populate('lab', 'name floor')
      .populate('scheduleSlot', 'startTime endTime room');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const patientUser = await User.findOne({ 
      $or: [
        { nic: booking.patient.nic }, 
        { phone: booking.patient.mobile }
      ] 
    });

    if (patientUser) {
      const formattedDate = new Date(booking.appointmentDate).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      const timeSlot = booking.scheduleSlot && booking.scheduleSlot.startTime && booking.scheduleSlot.endTime
        ? `${booking.scheduleSlot.startTime} - ${booking.scheduleSlot.endTime}`
        : '10:00 AM - 12:00 PM';

      await Notification.create({
        user: patientUser._id,
        title: `Appointment Reminder`,
        message: `Reminder: You have an upcoming lab booking scheduled for ${formattedDate} at ${timeSlot}. Please be present.`,
        type: 'appointment',
        isRead: false
      });
      return res.status(200).json({ success: true, message: 'Reminder sent to patient' });
    } else {
      return res.status(404).json({ success: false, message: 'Patient account not found to send notification' });
    }
  } catch (err) {
    next(err);
  }
};

export {
  getCategories,
  getLabs,
  getLabById,
  getLabAvailability,
  createBooking,
  getBookingByRef,
  listBookings,
  updateBookingStatus,
  getDashboardStats,
  updateLabStatus,
  getSchedule,
  createScheduleSlot,
  updateScheduleSlot,
  deleteScheduleSlot,
  listReports,
  createReport,
  updateReport,
  sendBookingReminder,
};
