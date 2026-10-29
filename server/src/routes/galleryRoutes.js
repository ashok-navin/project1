import express from 'express';
import {
  getPublicGalleries,
  getAllGalleriesAdmin,
  getGalleryByIdAdmin,
  getGalleryById,
  getPrivateGalleryByToken,
  createGallery,
  updateGallery,
  deleteGallery,
  uploadGalleryMedia,
  deleteGalleryMediaItem,
  regenerateGalleryToken,
  downloadGalleryZip
} from '../controllers/galleryController.js';
import { authenticate, authorizeRoles, optionalAuth } from '../middleware/authMiddleware.js';
import { uploadMedia } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/public', getPublicGalleries);
router.get('/private/:token', getPrivateGalleryByToken);
router.get('/:id', optionalAuth, getGalleryById);
router.get('/:id/download-zip', optionalAuth, downloadGalleryZip);

// Admin routes
router.get('/admin/all', authenticate, authorizeRoles('ADMIN'), getAllGalleriesAdmin);
router.get('/admin/:id', authenticate, authorizeRoles('ADMIN'), getGalleryByIdAdmin);
router.post('/admin', authenticate, authorizeRoles('ADMIN'), uploadMedia.single('coverImage'), createGallery);
router.put('/admin/:id', authenticate, authorizeRoles('ADMIN'), uploadMedia.single('coverImage'), updateGallery);
router.delete('/admin/:id', authenticate, authorizeRoles('ADMIN'), deleteGallery);
router.post('/admin/:id/media', authenticate, authorizeRoles('ADMIN'), uploadMedia.array('media', 30), uploadGalleryMedia);
router.delete('/admin/:id/media/:mediaId', authenticate, authorizeRoles('ADMIN'), deleteGalleryMediaItem);
router.post('/admin/:id/regenerate-token', authenticate, authorizeRoles('ADMIN'), regenerateGalleryToken);

export default router;
