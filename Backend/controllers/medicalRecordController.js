import mongoose from 'mongoose';
import MedicalRecord from '../model/MedicalRecord.js';
import User from '../model/User.js';
import bcrypt from 'bcryptjs';

const listMedicalRecords = async (req, res, next) => {
  try {
    const { patientId, category, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (req.user.role === 'patient') {
      filter.patient = req.user.id;
    } else {
      if (!patientId) {
        return res.status(400).json({ success: false, message: 'patientId is required for staff' });
      }
      if (!mongoose.isValidObjectId(patientId)) {
        return res.status(400).json({ success: false, message: 'Invalid patientId' });
      }
      filter.patient = patientId;
    }

    if (category && category !== 'All') {
      filter.type = category;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ title: regex }, { hospital: regex }, { doctor: regex }];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * pageSize;

    const [records, total] = await Promise.all([
      MedicalRecord.find(filter)
        .sort({ date: -1 })
        .skip(skip)
        .limit(pageSize),
      MedicalRecord.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: records,
      meta: {
        total,
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (err) {
    next(err);
  }
};

const getMedicalRecordById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid medical record id' });
    }

    const record = await MedicalRecord.findById(id);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Medical record not found' });
    }

    if (req.user.role === 'patient' && record.patient.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this record' });
    }

    res.status(200).json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

const createMedicalRecord = async (req, res, next) => {
  try {
    const {
      patientId,
      title,
      hospital,
      doctor,
      date,
      status,
      type,
      values,
      appointment,
      doctorNotes,
      reportUrl
    } = req.body;

    const targetPatientId = req.user.role === 'patient' ? req.user.id : patientId;

    if (!targetPatientId || !mongoose.isValidObjectId(targetPatientId)) {
      return res.status(400).json({ success: false, message: 'Valid patientId is required' });
    }

    const requiredFields = { title, hospital, doctor, date, type };
    for (const [key, val] of Object.entries(requiredFields)) {
      if (!val) {
        return res.status(400).json({ success: false, message: `${key} is required` });
      }
    }

    const validTypes = ['Lab Reports', 'Scan Reports', 'Prescriptions', 'ECG', 'Vaccination'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ success: false, message: `type must be one of: ${validTypes.join(', ')}` });
    }

    const record = await MedicalRecord.create({
      patient: targetPatientId,
      title,
      hospital,
      doctor,
      date: new Date(date),
      status: status || 'Pending',
      type,
      values: values || {},
      appointment: appointment || null,
      doctorNotes: doctorNotes || '',
      reportUrl: reportUrl || null
    });

    res.status(201).json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

const updateMedicalRecord = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid medical record id' });
    }

    const record = await MedicalRecord.findById(id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Medical record not found' });
    }

    if (req.user.role === 'patient' && record.patient.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized modification' });
    }

    const allowedUpdates = [
      'title',
      'hospital',
      'doctor',
      'date',
      'status',
      'type',
      'values',
      'appointment',
      'doctorNotes',
      'reportUrl'
    ];

    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No updatable fields provided' });
    }

    const updatedRecord = await MedicalRecord.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updatedRecord });
  } catch (err) {
    next(err);
  }
};

const deleteMedicalRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid medical record id' });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required to delete a record' });
    }

    const record = await MedicalRecord.findById(id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Medical record not found' });
    }

    if (req.user.role === 'patient' && record.patient.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized delete action' });
    }

    // Verify password
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    await MedicalRecord.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: 'Medical record successfully deleted' });
  } catch (err) {
    next(err);
  }
};

const getPatientStats = async (req, res, next) => {
  try {
    const { patientId } = req.query;
    const targetPatientId = req.user.role === 'patient' ? req.user.id : patientId;

    if (!targetPatientId || !mongoose.isValidObjectId(targetPatientId)) {
      return res.status(400).json({ success: false, message: 'Valid patientId is required' });
    }

    const [latestBloodSugar, latestCholesterol, latestBloodPressure] = await Promise.all([
      MedicalRecord.findOne({
        patient: targetPatientId,
        'values.glucose': { $exists: true }
      }).sort({ date: -1 }),
      MedicalRecord.findOne({
        patient: targetPatientId,
        'values.cholesterol': { $exists: true }
      }).sort({ date: -1 }),
      MedicalRecord.findOne({
        patient: targetPatientId,
        $or: [
          { 'values.systolic': { $exists: true } },
          { 'values.diastolic': { $exists: true } }
        ]
      }).sort({ date: -1 })
    ]);

    const stats = {
      bloodSugar: null,
      cholesterol: null,
      bloodPressure: null
    };

    if (latestBloodSugar && latestBloodSugar.values) {
      stats.bloodSugar = {
        value: latestBloodSugar.values.glucose,
        unit: 'mg/dL',
        status: parseInt(latestBloodSugar.values.glucose, 10) < 100 ? 'Normal' : 'High',
        date: latestBloodSugar.date
      };
    }

    if (latestCholesterol && latestCholesterol.values) {
      stats.cholesterol = {
        value: latestCholesterol.values.cholesterol,
        unit: 'mg/dL',
        status: parseInt(latestCholesterol.values.cholesterol, 10) < 200 ? 'Normal' : 'Borderline',
        date: latestCholesterol.date
      };
    }

    if (latestBloodPressure && latestBloodPressure.values) {
      const sys = parseInt(latestBloodPressure.values.systolic, 10);
      const dia = parseInt(latestBloodPressure.values.diastolic, 10);
      let bpStatus = 'Normal';
      if (sys > 130 || dia > 80) bpStatus = 'High';

      stats.bloodPressure = {
        value: `${latestBloodPressure.values.systolic}/${latestBloodPressure.values.diastolic}`,
        unit: 'mmHg',
        status: bpStatus,
        date: latestBloodPressure.date
      };
    }

    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};

export {
  listMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
  getPatientStats
};
