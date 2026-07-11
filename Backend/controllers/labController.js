import mongoose from 'mongoose';

import Lab from '../model/Lab.js';
import LabCategory from '../model/LabCategory.js';
import LabBooking from '../model/LabBooking.js';
import LabSchedule from '../model/LabSchedule.js';
import LabReport from '../model/LabReport.js';

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
    const categories = await LabCategory.find({ isActive: true }).sort({ order: 1 });
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
    const skip = (pageNum - 1) * pageSize;

    const [labs, total] = await Promise.all([
      Lab.find(filter)
        .populate('category', 'name icon color')
        .populate('assignedNurse', 'name photo shift')
        .skip(skip)
        .limit(pageSize)
        .sort({ createdAt: -1 }),
      Lab.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: labs,
      meta: {
        total,
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
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
      .populate('assignedNurse', 'name photo shift phone');

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
    if (!date) {
      return res.status(400).json({ success: false, message: 'date query param is required' });
    }

    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid date format. Use ISO 8601 (YYYY-MM-DD)' });
    }

    const lab = await Lab.findById(id);
    if (!lab) {
      return res.status(404).json({ success: false, message: 'Lab not found' });
    }

    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);

    const scheduleSlots = await LabSchedule.find({
      lab: id,
      date: { $gte: dayStart, $lte: dayEnd },
      isActive: true,
    }).sort({ startTime: 1 });

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
        };
      })
    );

    const currentToken = await LabBooking.countDocuments({
      lab: id,
      appointmentDate: { $gte: dayStart, $lte: dayEnd },
      status: 'Checked-In',
    });

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

    const requiredFields = { labId, scheduleSlotId, appointmentDate };
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

    if (!mongoose.isValidObjectId(labId) || !mongoose.isValidObjectId(scheduleSlotId)) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'Invalid labId or scheduleSlotId' });
    }

    const [lab, slot] = await Promise.all([
      Lab.findById(labId).session(session),
      LabSchedule.findById(scheduleSlotId).session(session),
    ]);

    if (!lab) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: 'Lab not found' });
    }
    if (!slot) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: 'Schedule slot not found' });
    }

    const slotDate = new Date(appointmentDate);
    slotDate.setHours(0, 0, 0, 0);
    const slotDateEnd = new Date(slotDate);
    slotDateEnd.setHours(23, 59, 59, 999);

    const currentBooked = await LabBooking.countDocuments({
      lab: labId,
      scheduleSlot: scheduleSlotId,
      status: { $in: ['Pending', 'Confirmed', 'Checked-In'] },
    }).session(session);

    if (currentBooked >= slot.maxPatients) {
      await session.abortTransaction();
      return res.status(409).json({ success: false, message: 'This time slot is fully booked' });
    }

    const bookingRef = await generateBookingRef();
    const queueToken = await generateQueueToken(labId, appointmentDate);

    const [booking] = await LabBooking.create(
      [
        {
          bookingRef,
          lab: labId,
          scheduleSlot: scheduleSlotId,
          appointmentDate: new Date(appointmentDate),
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

    if (labId) {
      if (!mongoose.isValidObjectId(labId)) {
        return res.status(400).json({ success: false, message: 'Invalid labId' });
      }
      filter.lab = labId;
    }

    const validStatuses = ['Pending', 'Confirmed', 'Checked-In', 'Sample-Collected', 'Testing', 'Completed', 'Cancelled'];
    if (status) {
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: `status must be one of: ${validStatuses.join(', ')}` });
      }
      filter.status = status;
    }

    if (date) {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      filter.appointmentDate = { $gte: dayStart, $lte: dayEnd };
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

    res.status(200).json({
      success: true,
      data: bookings,
      meta: { total, page: pageNum, limit: pageSize, totalPages: Math.ceil(total / pageSize) },
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

    res.status(200).json({ success: true, message: `Booking status updated to ${status}`, data: booking });
  } catch (err) {
    next(err);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const { labId, date } = req.query;

    if (!labId || !mongoose.isValidObjectId(labId)) {
      return res.status(400).json({ success: false, message: 'Valid labId is required' });
    }

    const targetDate = date ? new Date(date) : new Date();
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);

    const baseFilter = { lab: labId, appointmentDate: { $gte: dayStart, $lte: dayEnd } };

    const [todayTotal, pending, processing, completed] = await Promise.all([
      LabBooking.countDocuments({ ...baseFilter }),
      LabBooking.countDocuments({ ...baseFilter, status: 'Pending' }),
      LabBooking.countDocuments({ ...baseFilter, status: { $in: ['Checked-In', 'Sample-Collected', 'Testing'] } }),
      LabBooking.countDocuments({ ...baseFilter, status: 'Completed' }),
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

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const slots = await LabSchedule.find({
      lab: labId,
      date: { $gte: dayStart, $lte: dayEnd },
    }).sort({ startTime: 1 });

    const enriched = await Promise.all(
      slots.map(async (slot) => {
        const booked = await LabBooking.countDocuments({
          lab: labId,
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

    const lab = await Lab.findById(labId);
    if (!lab) return res.status(404).json({ success: false, message: 'Lab not found' });

    const slot = await LabSchedule.create({
      lab: labId,
      date: new Date(date),
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

    const allowedUpdates = ['startTime', 'endTime', 'maxPatients', 'nurse', 'room', 'type', 'isActive'];
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

    const slot = await LabSchedule.findByIdAndUpdate(slotId, { isActive: false }, { new: true });
    if (!slot) return res.status(404).json({ success: false, message: 'Schedule slot not found' });

    res.status(200).json({ success: true, message: 'Schedule slot deactivated' });
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
        .populate('booking', 'bookingRef queueToken')
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
};
