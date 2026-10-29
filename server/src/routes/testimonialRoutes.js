import express from 'express';
import {
  getTestimonials,
  getAllTestimonialsAdmin,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial
} from '../controllers/testimonialController.js';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getTestimonials);
router.get('/admin', authenticate, authorizeRoles('ADMIN'), getAllTestimonialsAdmin);
router.post('/admin', authenticate, authorizeRoles('ADMIN'), createTestimonial);
router.put('/admin/:id', authenticate, authorizeRoles('ADMIN'), updateTestimonial);
router.delete('/admin/:id', authenticate, authorizeRoles('ADMIN'), deleteTestimonial);

export default router;
