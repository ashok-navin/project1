import express from 'express';
import {
  getPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage
} from '../controllers/packageController.js';
import { authenticate, authorizeRoles, optionalAuth } from '../middleware/authMiddleware.js';
import { uploadMedia } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getPackages);
router.get('/:id', getPackageById);

// Admin routes (prefixed or mounted directly)
router.post('/admin', authenticate, authorizeRoles('ADMIN'), uploadMedia.single('coverImage'), createPackage);
router.put('/admin/:id', authenticate, authorizeRoles('ADMIN'), uploadMedia.single('coverImage'), updatePackage);
router.delete('/admin/:id', authenticate, authorizeRoles('ADMIN'), deletePackage);

export default router;
