import User from '../model/User.js';
import Appointment from '../model/Appointment.js';
import AIAnalysisLog from '../model/AIAnalysisLog.js';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

const REPORT_TITLES = {
  'patient-registration': 'Patient Registration Summary',
  'doctor-consultation': 'Doctor Consultation Summary',
  'appointment-activity': 'Appointment Activity',
  'ai-diagnostics': 'AI Symptom Analyzer Diagnostics',
};

const REPORT_DESCRIPTION = {
  'patient-registration': 'System wide patient onboarding and user growth',
  'doctor-consultation': 'Consultation volume and doctor workload distribution',
  'appointment-activity': 'Appointment lifecycle and daily booking activity',
  'ai-diagnostics': 'AI symptom analysis usage and specialist recommendations',
};

const resolveReportRange = (range = '30d', from, to) => {
  const now = new Date();
  let start;
  let end = new Date(now);

  if (from && to) {
    start = new Date(from);
    end = new Date(to);
  } else {
    switch (range) {
      case '7d':
        start = new Date(now);
        start.setDate(start.getDate() - 7);
        break;
      case '90d':
        start = new Date(now);
        start.setDate(start.getDate() - 90);
        break;
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        break;
      case '30d':
      default:
        start = new Date(now);
        start.setDate(start.getDate() - 30);
        break;
    }
  }

  if (!(start instanceof Date) || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error('Invalid report date range');
  }

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  const label = `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  return { start, end, label };
};

const getReportTitle = (reportType) => REPORT_TITLES[reportType] || 'Report';

const getReportDescription = (reportType) => REPORT_DESCRIPTION[reportType] || 'Generated admin report';

const mapStatusCounts = (items, key = 'status') => items.reduce((accumulator, item) => {
  const value = String(item?.[key] || 'unknown').toLowerCase();
  accumulator[value] = (accumulator[value] || 0) + 1;
  return accumulator;
}, {});

const normalizeExportText = (value) => {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const generatePdfBuffer = ({ title, description, rangeLabel, summary, rows }) => new Promise((resolve, reject) => {
  const doc = new PDFDocument({ size: 'A4', margin: 36 });
  const chunks = [];

  doc.on('data', chunk => chunks.push(chunk));
  doc.on('end', () => resolve(Buffer.concat(chunks)));
  doc.on('error', reject);

  doc.fontSize(18).fillColor('#111827').text(title);
  doc.moveDown(0.3);
  doc.fontSize(10).fillColor('#6B7280').text(description);
  doc.moveDown(0.4);
  doc.fontSize(11).fillColor('#111827').text(`Range: ${rangeLabel}`);
  doc.moveDown(0.5);

  doc.fontSize(14).fillColor('#111827').text('Summary');
  doc.moveDown(0.2);
  Object.entries(summary).forEach(([key, value]) => {
    doc.fontSize(10).fillColor('#111827').text(`${key}: ${normalizeExportText(value)}`);
  });

  doc.moveDown(0.5);
  doc.fontSize(14).fillColor('#111827').text('Details');
  doc.moveDown(0.2);

  rows.slice(0, 50).forEach((row, index) => {
    const parts = Object.entries(row).map(([key, value]) => `${key}: ${normalizeExportText(value)}`);
    doc.fontSize(9).fillColor('#111827').text(`${index + 1}. ${parts.join(' | ')}`, {
      width: 520,
    });
    doc.moveDown(0.25);
  });

  doc.end();
});

const generateExcelBuffer = async ({ title, description, rangeLabel, summary, rows }) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'MediAI Admin Reports';
  workbook.created = new Date();

  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.addRow([title]);
  summarySheet.addRow([description]);
  summarySheet.addRow([`Range: ${rangeLabel}`]);
  summarySheet.addRow([]);
  summarySheet.addRow(['Metric', 'Value']);
  Object.entries(summary).forEach(([key, value]) => {
    summarySheet.addRow([key, normalizeExportText(value)]);
  });
  summarySheet.getColumn(1).width = 34;
  summarySheet.getColumn(2).width = 40;

  const detailsSheet = workbook.addWorksheet('Details');
  const detailKeys = rows.length > 0 ? Array.from(new Set(rows.flatMap(row => Object.keys(row)))) : ['No data'];
  detailsSheet.addRow(detailKeys);
  rows.forEach(row => {
    detailsSheet.addRow(detailKeys.map(key => normalizeExportText(row[key])));
  });
  detailKeys.forEach((_, index) => {
    detailsSheet.getColumn(index + 1).width = 24;
  });

  return workbook.xlsx.writeBuffer();
};

const buildReportPayload = async (reportType, rangeInput, from, to) => {
  const range = resolveReportRange(rangeInput, from, to);
  const title = getReportTitle(reportType);
  const description = getReportDescription(reportType);

  if (reportType === 'patient-registration') {
    const [totalPatients, totalDoctors, totalNurses, newPatients, newRegistrations, recentUsers] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'doctor' }),
      User.countDocuments({ role: 'nurse' }),
      User.countDocuments({ role: 'patient', createdAt: { $gte: range.start, $lte: range.end } }),
      User.countDocuments({ createdAt: { $gte: range.start, $lte: range.end } }),
      User.find({ createdAt: { $gte: range.start, $lte: range.end } })
        .select('name email role status createdAt')
        .sort({ createdAt: -1 })
        .limit(20),
    ]);

    return {
      title,
      description,
      range,
      summary: {
        totalPatients,
        totalDoctors,
        totalNurses,
        newPatients,
        newRegistrations,
      },
      rows: recentUsers.map(user => ({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      })),
    };
  }

  if (reportType === 'doctor-consultation') {
    const appointments = await Appointment.find({ date: { $gte: range.start, $lte: range.end } })
      .populate('doctor', 'name specialization')
      .populate('patient', 'name')
      .sort({ date: -1 });

    const doctorMap = new Map();
    appointments.forEach(appointment => {
      const doctorId = String(appointment.doctor?._id || appointment.doctor || 'unknown');
      const current = doctorMap.get(doctorId) || {
        doctorName: appointment.doctor?.name || 'Unknown Doctor',
        specialization: appointment.doctor?.specialization || 'General',
        total: 0,
        completed: 0,
        pending: 0,
        cancelled: 0,
      };

      current.total += 1;
      current[appointment.status] = (current[appointment.status] || 0) + 1;
      doctorMap.set(doctorId, current);
    });

    const statusCounts = mapStatusCounts(appointments);

    return {
      title,
      description,
      range,
      summary: {
        totalAppointments: appointments.length,
        completed: statusCounts.completed || 0,
        pending: statusCounts.pending || 0,
        cancelled: statusCounts.cancelled || 0,
        doctorsInvolved: doctorMap.size,
      },
      rows: Array.from(doctorMap.values()).sort((a, b) => b.total - a.total),
    };
  }

  if (reportType === 'appointment-activity') {
    const appointments = await Appointment.find({ createdAt: { $gte: range.start, $lte: range.end } })
      .populate('doctor', 'name')
      .populate('patient', 'name')
      .sort({ createdAt: -1 });

    const dayMap = new Map();
    appointments.forEach(appointment => {
      const dayKey = appointment.createdAt.toISOString().slice(0, 10);
      const current = dayMap.get(dayKey) || {
        day: dayKey,
        total: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
      };

      current.total += 1;
      current[appointment.status] = (current[appointment.status] || 0) + 1;
      dayMap.set(dayKey, current);
    });

    const statusCounts = mapStatusCounts(appointments);

    return {
      title,
      description,
      range,
      summary: {
        totalAppointments: appointments.length,
        pending: statusCounts.pending || 0,
        confirmed: statusCounts.confirmed || 0,
        completed: statusCounts.completed || 0,
        cancelled: statusCounts.cancelled || 0,
      },
      rows: Array.from(dayMap.values()).sort((a, b) => a.day.localeCompare(b.day)),
    };
  }

  if (reportType === 'ai-diagnostics') {
    const logs = await AIAnalysisLog.find({ createdAt: { $gte: range.start, $lte: range.end } })
      .populate('patient', 'name')
      .sort({ createdAt: -1 });

    const specialistCounts = new Map();
    const uniquePatients = new Set();
    let predictedConditionTotal = 0;

    logs.forEach(log => {
      if (log.patient?._id) {
        uniquePatients.add(String(log.patient._id));
      }
      predictedConditionTotal += Array.isArray(log.predictedConditions) ? log.predictedConditions.length : 0;
      const specialist = log.recommendedSpecialist || 'General Practitioner';
      specialistCounts.set(specialist, (specialistCounts.get(specialist) || 0) + 1);
    });

    const topSpecialist = Array.from(specialistCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'General Practitioner';

    return {
      title,
      description,
      range,
      summary: {
        totalAnalyses: logs.length,
        uniquePatients: uniquePatients.size,
        averagePredictedConditions: logs.length ? (predictedConditionTotal / logs.length).toFixed(2) : '0.00',
        topSpecialist,
      },
      rows: logs.slice(0, 20).map(log => ({
        patient: log.patient?.name || 'Unknown Patient',
        specialist: log.recommendedSpecialist || 'General Practitioner',
        predictedConditions: log.predictedConditions || [],
        createdAt: log.createdAt,
      })),
    };
  }

  throw new Error('Unsupported report type');
};

export const getAdminReport = async (req, res) => {
  try {
    const { reportType, range = '30d', from, to } = req.query;

    if (!reportType || !REPORT_TITLES[reportType]) {
      return res.status(400).json({ message: 'Invalid reportType provided' });
    }

    const payload = await buildReportPayload(reportType, range, from, to);

    res.json({
      success: true,
      data: {
        reportType,
        title: payload.title,
        description: payload.description,
        range: payload.range,
        summary: payload.summary,
        rows: payload.rows,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const exportAdminReport = async (req, res) => {
  try {
    const { reportType, range = '30d', from, to, format = 'pdf' } = req.query;

    if (!reportType || !REPORT_TITLES[reportType]) {
      return res.status(400).json({ message: 'Invalid reportType provided' });
    }

    const payload = await buildReportPayload(reportType, range, from, to);
    const fileBase = `${reportType}-${range}`.replace(/[^a-z0-9-_]/gi, '-').toLowerCase();

    if (format === 'excel') {
      const buffer = await generateExcelBuffer(payload);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${fileBase}.xlsx"`);
      return res.status(200).send(Buffer.from(buffer));
    }

    const buffer = await generatePdfBuffer(payload);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileBase}.pdf"`);
    return res.status(200).send(buffer);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get overall system statistics for the admin dashboard
// @route   GET /api/admin/stats
// @access  Private (Admin only)
export const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalNurses = await User.countDocuments({ role: 'nurse' });
    const totalAppointments = await Appointment.countDocuments();

    res.json({
      success: true,
      data: {
        users: totalUsers,
        patients: totalPatients,
        doctors: totalDoctors,
        nurses: totalNurses,
        appointments: totalAppointments
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get list of all users in the system
// @route   GET /api/admin/users
// @access  Private (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const filter = {};
    
    // Optional filtering by role (e.g. /api/admin/users?role=doctor)
    if (req.query.role) {
      filter.role = req.query.role;
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update a user's role (e.g., promote patient to admin/nurse)
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin only)
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['patient', 'doctor', 'nurse', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role provided' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    const updatedUser = await user.save();

    res.json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a user from the database entirely
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User removed successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all pending doctor/nurse requests
// @route   GET /api/admin/requests
// @access  Private (Admin only)
export const getPendingRequests = async (req, res) => {
  try {
    const requests = await User.find({ status: 'pending' }).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Approve a pending request
// @route   PUT /api/admin/requests/:id/approve
// @access  Private (Admin only)
export const approveRequest = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.status = 'approved';
    const updatedUser = await user.save();
    res.json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Reject a pending request
// @route   PUT /api/admin/requests/:id/reject
// @access  Private (Admin only)
export const rejectRequest = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.status = 'rejected';
    const updatedUser = await user.save();
    res.json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Request additional documents from a pending doctor request
// @route   PUT /api/admin/requests/:id/request-docs
// @access  Private (Admin only)
export const requestAdditionalDocuments = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Please provide a document request message' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = 'pending';
    user.verificationNotes = message.trim();
    user.verificationRequestedAt = new Date();
    user.verificationRequestedBy = req.user?._id;

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Document request saved successfully',
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Add a new user manually (admin creates patient/doctor/nurse)
// @route   POST /api/admin/users
// @access  Private (Admin only)
export const addUser = async (req, res) => {
  try {
    const { name, email, phone, password, role, specialization, department } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { phone }] });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email or phone already exists' });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role,
      specialization,
      department,
      status: 'active'
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update user profile details (name, email, specialization, department)
// @route   PUT /api/admin/users/:id
// @access  Private (Admin only)
export const updateUserDetails = async (req, res) => {
  try {
    const { name, email, specialization, department } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (specialization && user.role === 'doctor') user.specialization = specialization;
    if (department && user.role === 'nurse') user.department = department;

    const updatedUser = await user.save();

    res.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update user status (active, suspended, disabled, verified)
// @route   PATCH /api/admin/users/:id/status
// @access  Private (Admin only)
export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected', 'active', 'suspended', 'disabled', 'verified'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = status;
    const updatedUser = await user.save();

    res.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
