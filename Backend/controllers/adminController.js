import User from '../model/User.js';
import Appointment from '../model/Appointment.js';

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
