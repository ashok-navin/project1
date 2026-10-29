import express from 'express';
import {
  register,
  login,
  getCurrentUser,
  updateProfile,
  forgotPassword,
  verifyResetOtp,
  resetPassword
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', (req, res) => res.json({ success: true, message: 'Logged out successfully.' }));
router.get('/me', authenticate, getCurrentUser);
router.put('/profile', authenticate, updateProfile);

router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);

export default router;
