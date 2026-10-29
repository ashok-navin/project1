import express from 'express';
import { submitContactEnquiry, getEnquiries, updateEnquiryStatus } from '../controllers/contactController.js';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', submitContactEnquiry);
router.get('/admin', authenticate, authorizeRoles('ADMIN'), getEnquiries);
router.patch('/admin/:id', authenticate, authorizeRoles('ADMIN'), updateEnquiryStatus);

export default router;
