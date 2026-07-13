import express from 'express';
import { registerUser, loginUser, getMe, sendOTP, forgotPassword, verifyResetOTP, resetPassword, changePassword, googleLogin } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.post('/send-otp', sendOTP);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.post('/change-password', protect, changePassword);

export default router;
