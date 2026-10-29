import express from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  getAllBookings,
  updateBookingStatus,
  updateBookingNotes,
  getAdminCalendar,
  getDashboardStats
} from '../controllers/bookingController.js';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Customer booking routes (requires authentication)
router.post('/', authenticate, createBooking);
router.get('/my', authenticate, getMyBookings);
router.get('/:id', authenticate, getBookingById);

// Admin booking & dashboard routes
router.get('/admin/all', authenticate, authorizeRoles('ADMIN'), getAllBookings);
router.patch('/admin/:id/status', authenticate, authorizeRoles('ADMIN'), updateBookingStatus);
router.patch('/admin/:id/notes', authenticate, authorizeRoles('ADMIN'), updateBookingNotes);
router.get('/admin/calendar', authenticate, authorizeRoles('ADMIN'), getAdminCalendar);
router.get('/admin/dashboard/stats', authenticate, authorizeRoles('ADMIN'), getDashboardStats);

export default router;
