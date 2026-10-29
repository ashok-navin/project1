import express from 'express';
import {
  getActiveLiveEvent,
  getActiveLivePhotos,
  downloadLivePhoto,
  downloadAllLivePhotos,
  getPermanentQRCode,
  startLiveEvent,
  uploadLivePhotos,
  endLiveEvent,
  getArchivedEvents,
  getArchivedEventPhotos
} from '../controllers/liveEventController.js';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';
import { uploadPhotosOnly } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public guest routes (NO login required)
router.get('/active', getActiveLiveEvent);
router.get('/photos', getActiveLivePhotos);
router.get('/photos/:photoId/download', downloadLivePhoto);
router.get('/photos/download-all', downloadAllLivePhotos);
router.get('/permanent-qr', getPermanentQRCode);

// Admin live event controls
router.post('/admin/start', authenticate, authorizeRoles('ADMIN'), startLiveEvent);
router.post('/admin/upload', authenticate, authorizeRoles('ADMIN'), uploadPhotosOnly.array('photos', 50), uploadLivePhotos);
router.post('/admin/end', authenticate, authorizeRoles('ADMIN'), endLiveEvent);
router.get('/admin/archives', authenticate, authorizeRoles('ADMIN'), getArchivedEvents);
router.get('/admin/archives/:eventId', authenticate, authorizeRoles('ADMIN'), getArchivedEventPhotos);

export default router;
