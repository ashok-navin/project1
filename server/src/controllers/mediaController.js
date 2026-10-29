import { streamFileToResponse, getGridFSFileInfo } from '../services/gridfsService.js';

// GET /api/media/:fileId
// Stream media (image or video with HTTP 206 support)
export const getMediaStream = async (req, res) => {
  try {
    const { fileId } = req.params;
    await streamFileToResponse(fileId, req, res, false);
  } catch (error) {
    console.error('[Media Stream Error]:', error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: 'Failed to stream media.' });
    }
  }
};

// GET /api/media/:fileId/download
// Download original media file
export const downloadMediaFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    await streamFileToResponse(fileId, req, res, true);
  } catch (error) {
    console.error('[Media Download Error]:', error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: 'Failed to download media.' });
    }
  }
};

// GET /api/media/:fileId/info
export const getMediaInfo = async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await getGridFSFileInfo(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found.' });
    }
    return res.status(200).json({ success: true, file });
  } catch (error) {
    console.error('[Media Info Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch media metadata.' });
  }
};
