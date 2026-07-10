import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../model/User.js';
import OTP from '../model/OTP.js';
import sendEmail from '../config/emailService.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Send OTP to email
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide an email' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Generate a random 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save/Update OTP in DB (overwrite existing OTPs for the same email)
    await OTP.findOneAndUpdate(
      { email: email.toLowerCase() },
      { otp: otpCode, createdAt: new Date() },
      { upsert: true, returnDocument: 'after' }
    );

    // Send email
    await sendEmail({
      email,
      subject: 'MediAI Verification Code',
      message: `Your verification code is ${otpCode}. It is valid for 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #3b82f6;">MediAI Account Verification</h2>
          <p>Thank you for signing up with MediAI. Please use the verification code below to complete your registration:</p>
          <div style="background: #f3f4f6; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; border-radius: 5px; margin: 20px 0;">
            ${otpCode}
          </div>
          <p>This code is valid for <strong>5 minutes</strong>. If you did not request this, please ignore this email.</p>
        </div>
      `,
    });

    res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending OTP', error: error.message });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, role, otp, staffId } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'Please add all required fields' });
    }

    // If registering as a patient, require and verify OTP
    const targetRole = role || 'patient';
    if (targetRole === 'patient') {
      if (!otp) {
        return res.status(400).json({ message: 'Please provide the verification OTP' });
      }

      // Check OTP in DB
      const otpRecord = await OTP.findOne({ email: email.toLowerCase() });
      if (!otpRecord || otpRecord.otp !== otp) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }

      // Delete the verified OTP record
      await OTP.deleteOne({ _id: otpRecord._id });
    }

    // Check if user exists by email or phone
    const userExists = await User.findOne({ $or: [{ email }, { phone }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Set initial status based on role
    const initialStatus = (targetRole === 'doctor' || targetRole === 'nurse') ? 'pending' : 'approved';

    // Create user (password hashing is handled by the pre-save hook in the User model)
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      role: targetRole,
      status: initialStatus,
      staffId: staffId || undefined,
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Authenticate a user (Login)
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide an email and password' });
    }

    // Find user by either email or phone number
    const user = await User.findOne({ 
      $or: [
        { email: email.toLowerCase() }, 
        { phone: email }
      ] 
    }).select('+password');

    if (user && (await bcrypt.compare(password, user.password))) {
      if (user.status === 'pending') {
        return res.status(401).json({ message: 'Your account is pending admin approval' });
      }
      if (user.status === 'rejected') {
        return res.status(401).json({ message: 'Your request was rejected' });
      }

      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get currently logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    // req.user will be populated by the authMiddleware
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Change Password for Logged In User
// @route   POST /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new passwords' });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    // Update to new password (pre-save hook will hash it)
    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Forgot Password - Send OTP to email
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide an email' });
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    // Generate a random 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save/Update OTP in DB
    await OTP.findOneAndUpdate(
      { email: email.toLowerCase() },
      { otp: otpCode, createdAt: new Date() },
      { upsert: true, returnDocument: 'after' }
    );

    // Send email
    await sendEmail({
      email: user.email,
      subject: 'MediAI Password Reset Verification Code',
      message: `Your verification code to reset password is ${otpCode}. It is valid for 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #3b82f6;">MediAI Password Reset</h2>
          <p>We received a request to reset your password. Please use the verification code below to complete the reset process:</p>
          <div style="background: #f3f4f6; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; border-radius: 5px; margin: 20px 0;">
            ${otpCode}
          </div>
          <p>This code is valid for <strong>5 minutes</strong>. If you did not request this, please ignore this email.</p>
        </div>
      `,
    });

    res.status(200).json({ success: true, message: 'Password reset OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending OTP', error: error.message });
  }
};

// @desc    Verify OTP for Password Reset
// @route   POST /api/auth/verify-reset-otp
// @access  Public
export const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Please provide email and OTP' });
    }

    const otpRecord = await OTP.findOne({ email: email.toLowerCase() });
    if (!otpRecord || otpRecord.otp !== otp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    res.status(200).json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ message: 'Please provide email, OTP, and new password' });
    }

    // Verify OTP one more time for security
    const otpRecord = await OTP.findOne({ email: email.toLowerCase() });
    if (!otpRecord || otpRecord.otp !== otp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Set new password (the model's pre-save hook will hash it automatically)
    user.password = password;
    await user.save();

    // Clean up OTP record
    await OTP.deleteOne({ _id: otpRecord._id });

    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
