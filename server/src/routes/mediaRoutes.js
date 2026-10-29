import express from 'express';
import { getMediaStream, downloadMediaFile, getMediaInfo } from '../controllers/mediaController.js';

const router = express.Router();

router.get('/:fileId', getMediaStream);
router.get('/:fileId/download', downloadMediaFile);
router.get('/:fileId/info', getMediaInfo);

export default router;
