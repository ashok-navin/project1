import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';
import { connectDB } from '../src/config/db.js';

const createInitialAdmin = async () => {
  try {
    console.log('[Setup] Connecting to MongoDB to initialize administrator...');
    await connectDB();

    const email = (process.env.ADMIN_INITIAL_EMAIL || 'admin@5star.com').toLowerCase().trim();
    const password = process.env.ADMIN_INITIAL_PASSWORD || 'Admin@5Star2026!';
    const name = process.env.ADMIN_INITIAL_NAME || '5Star Studio Director';
    const mobile = process.env.ADMIN_INITIAL_MOBILE || '+91 9876543210';

    const existingAdmin = await User.findOne({ email });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    if (existingAdmin) {
      existingAdmin.role = 'ADMIN';
      existingAdmin.passwordHash = passwordHash;
      existingAdmin.name = name;
      existingAdmin.mobile = mobile;
      existingAdmin.isActive = true;
      await existingAdmin.save();
      console.log(`[Success] Existing admin user (${email}) updated with configured password and ADMIN role.`);
    } else {
      await User.create({
        name,
        email,
        passwordHash,
        mobile,
        role: 'ADMIN',
        isActive: true
      });
      console.log(`[Success] Brand new administrator account created!`);
    }

    console.log(`-----------------------------------------------------`);
    console.log(`Admin Login Email   : ${email}`);
    console.log(`Admin Password      : ${password}`);
    console.log(`Admin Role          : ADMIN`);
    console.log(`-----------------------------------------------------`);
    process.exit(0);
  } catch (error) {
    console.error('[Error] Admin setup failed:', error);
    process.exit(1);
  }
};

createInitialAdmin();
