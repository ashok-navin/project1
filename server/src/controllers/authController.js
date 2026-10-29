import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import PasswordResetOTP from '../models/PasswordResetOTP.js';
import { generateToken } from '../utils/token.js';
import { sendPasswordResetOTP } from '../services/emailService.js';

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, mobile } = req.body;

    if (!name || !email || !password || !mobile) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Explicitly enforce CUSTOMER role (security requirement: customers cannot register as admin)
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      mobile: mobile.trim(),
      role: 'CUSTOMER'
    });

    const token = generateToken({ id: newUser._id, role: newUser.role });

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to 5Star Cinematography.',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        mobile: newUser.mobile,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('[Register Error]:', error);
    return res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'This account has been deactivated. Contact studio admin.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken({ id: user._id, role: user.role });

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role
      }
    });
  } catch (error) {
    console.error('[Login Error]:', error);
    return res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};

// GET /api/auth/me
export const getCurrentUser = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      mobile: req.user.mobile,
      role: req.user.role,
      createdAt: req.user.createdAt
    }
  });
};

// PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, mobile, password, currentPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name.trim();
    if (mobile) user.mobile = mobile.trim();

    if (password) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password is required to set a new password.' });
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Incorrect current password.' });
      }
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(password, salt);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role
      }
    });
  } catch (error) {
    console.error('[Update Profile Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your email address.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // Prevent account enumeration by always returning generic message
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If that email address is registered with us, a 6-digit verification code has been sent.'
      });
    }

    // Invalidate existing unused OTPs
    await PasswordResetOTP.deleteMany({ userId: user._id });

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    // Expires in 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await PasswordResetOTP.create({
      userId: user._id,
      email: normalizedEmail,
      otpHash,
      expiresAt
    });

    // Send email via Nodemailer
    await sendPasswordResetOTP(normalizedEmail, otp);

    return res.status(200).json({
      success: true,
      message: 'If that email address is registered with us, a 6-digit verification code has been sent.'
    });
  } catch (error) {
    console.error('[Forgot Password Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to process password reset request.' });
  }
};

// POST /api/auth/verify-reset-otp
export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and verification code are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const otpRecord = await PasswordResetOTP.findOne({
      email: normalizedEmail,
      isConsumed: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code. Please request a new one.' });
    }

    if (otpRecord.attempts >= 5) {
      await PasswordResetOTP.deleteOne({ _id: otpRecord._id });
      return res.status(429).json({ success: false, message: 'Too many incorrect attempts. Please request a new code.' });
    }

    const hashedInput = crypto.createHash('sha256').update(otp.trim()).digest('hex');
    if (hashedInput !== otpRecord.otpHash) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ success: false, message: 'Incorrect verification code. Please try again.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Code verified successfully. You may now set your new password.'
    });
  } catch (error) {
    console.error('[Verify OTP Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to verify code.' });
  }
};

// POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const otpRecord = await PasswordResetOTP.findOne({
      email: normalizedEmail,
      isConsumed: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code.' });
    }

    const hashedInput = crypto.createHash('sha256').update(otp.trim()).digest('hex');
    if (hashedInput !== otpRecord.otpHash) {
      return res.status(400).json({ success: false, message: 'Invalid verification code.' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Mark OTP as consumed and delete
    otpRecord.isConsumed = true;
    otpRecord.consumedAt = new Date();
    await otpRecord.save();
    await PasswordResetOTP.deleteMany({ userId: user._id });

    return res.status(200).json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.'
    });
  } catch (error) {
    console.error('[Reset Password Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to reset password.' });
  }
};
