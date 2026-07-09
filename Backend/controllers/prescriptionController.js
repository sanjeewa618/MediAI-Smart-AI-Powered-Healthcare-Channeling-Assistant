import Prescription from '../model/Prescription.js';
import User from '../model/User.js';

// @desc    Create a new prescription
// @route   POST /api/prescriptions
// @access  Private (Doctor only)
export const createPrescription = async (req, res) => {
  try {
    const { patientId, appointmentId, medicines, instructions } = req.body;
    const doctorId = req.user.id;

    if (!patientId || !medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({ message: 'Patient ID and at least one medicine are required' });
    }

    // Verify patient exists
    const patientExists = await User.findById(patientId);
    if (!patientExists || patientExists.role !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const prescription = await Prescription.create({
      patient: patientId,
      doctor: doctorId,
      appointment: appointmentId || undefined,
      medicines,
      instructions,
    });

    res.status(201).json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all prescriptions (filtered by user role)
// @route   GET /api/prescriptions
// @access  Private (Patient and Doctor)
export const getPrescriptions = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    let query = {};

    if (userRole === 'patient') {
      query.patient = userId;
    } else if (userRole === 'doctor') {
      query.doctor = userId;
    } else {
      // Admins/Nurses can see all or select based on queries
      if (req.query.patientId) {
        query.patient = req.query.patientId;
      }
      if (req.query.doctorId) {
        query.doctor = req.query.doctorId;
      }
    }

    const prescriptions = await Prescription.find(query)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialization hospital')
      .populate('appointment', 'date time')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      data: prescriptions,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get a single prescription by ID
// @route   GET /api/prescriptions/:id
// @access  Private
export const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialization hospital')
      .populate('appointment', 'date time');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Check authorization: must be the patient, doctor, or an admin/nurse
    const userId = req.user.id;
    const userRole = req.user.role;

    if (
      userRole !== 'admin' &&
      userRole !== 'nurse' &&
      prescription.patient._id.toString() !== userId &&
      prescription.doctor._id.toString() !== userId
    ) {
      return res.status(403).json({ message: 'Not authorized to view this prescription' });
    }

    res.status(200).json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a prescription
// @route   DELETE /api/prescriptions/:id
// @access  Private (Doctor or Admin only)
export const deletePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Only the issuing doctor or an admin can delete it
    if (req.user.role !== 'admin' && prescription.doctor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this prescription' });
    }

    await prescription.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Prescription deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
