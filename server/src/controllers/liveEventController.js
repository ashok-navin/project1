import LiveEvent from '../models/LiveEvent.js';
import LivePhoto from '../models/LivePhoto.js';
import QRCode from 'qrcode';
import {
  uploadBufferToGridFS,
  deleteGridFSFile,
  streamFileToResponse,
  streamZipArchive
} from '../services/gridfsService.js';

// Format sequence numbers like 000001, 000002
const formatSequence = (num) => {
  return String(num).padStart(6, '0');
};

// GET /api/live/active
// Public: returns active live event details or null
export const getActiveLiveEvent = async (req, res) => {
  try {
    const activeEvent = await LiveEvent.findOne({ status: 'Active' });
    if (!activeEvent) {
      return res.status(200).json({
        success: true,
        hasActiveEvent: false,
        message: 'No live event is currently taking place. Please check back when the next event begins.'
      });
    }

    return res.status(200).json({
      success: true,
      hasActiveEvent: true,
      event: {
        id: activeEvent._id,
        name: activeEvent.name,
        category: activeEvent.category,
        eventDate: activeEvent.eventDate,
        description: activeEvent.description,
        startedAt: activeEvent.startedAt,
        photoCount: activeEvent.photoCount
      }
    });
  } catch (error) {
    console.error('[Get Active Event Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to check active event.' });
  }
};

// GET /api/live/photos
// Public: fetch all photos for active live event in sequential order
export const getActiveLivePhotos = async (req, res) => {
  try {
    const activeEvent = await LiveEvent.findOne({ status: 'Active' });
    if (!activeEvent) {
      return res.status(200).json({
        success: true,
        hasActiveEvent: false,
        photos: []
      });
    }

    const { page = 1, limit = 100 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await LivePhoto.countDocuments({ eventId: activeEvent._id });
    const photos = await LivePhoto.find({ eventId: activeEvent._id })
      .sort({ sequenceNumber: -1 }) // Newest photos first, or chronological
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      hasActiveEvent: true,
      event: {
        id: activeEvent._id,
        name: activeEvent.name,
        category: activeEvent.category,
        eventDate: activeEvent.eventDate,
        startedAt: activeEvent.startedAt
      },
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      photos: photos.map((p) => ({
        id: p._id,
        gridFsFileId: p.gridFsFileId,
        sequenceNumber: p.sequenceNumber,
        formattedSequence: p.formattedSequence,
        originalFilename: p.originalFilename,
        size: p.size,
        uploadedAt: p.uploadedAt
      }))
    });
  } catch (error) {
    console.error('[Get Live Photos Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch event photos.' });
  }
};

// GET /api/live/photos/:photoId/download
// Public: download single original high-resolution photo without login
export const downloadLivePhoto = async (req, res) => {
  try {
    const photo = await LivePhoto.findById(req.params.photoId);
    if (!photo) {
      return res.status(404).json({ success: false, message: 'Live photo not found.' });
    }

    const downloadName = `5Star_${photo.formattedSequence}_${photo.originalFilename}`;
    await streamFileToResponse(photo.gridFsFileId, req, res, true, downloadName);
  } catch (error) {
    console.error('[Download Live Photo Error]:', error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: 'Failed to download photo.' });
    }
  }
};

// GET /api/live/photos/download-all
// Public: stream a ZIP of all photos from active event without login
export const downloadAllLivePhotos = async (req, res) => {
  try {
    const activeEvent = await LiveEvent.findOne({ status: 'Active' });
    if (!activeEvent) {
      return res.status(404).json({ success: false, message: 'No live event is currently active.' });
    }

    const photos = await LivePhoto.find({ eventId: activeEvent._id }).sort({ sequenceNumber: 1 });
    if (photos.length === 0) {
      return res.status(400).json({ success: false, message: 'No photos uploaded yet for this live event.' });
    }

    const fileEntries = photos.map((p) => ({
      gridFsFileId: p.gridFsFileId,
      filename: `Photo_${p.formattedSequence}_${p.originalFilename}`
    }));

    const safeEventName = activeEvent.name.replace(/[^a-zA-Z0-9]/g, '_');
    const zipName = `5Star_Live_${safeEventName}_All_Photos.zip`;

    await streamZipArchive(fileEntries, zipName, res);
  } catch (error) {
    console.error('[Download All Photos Error]:', error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: 'Failed to generate ZIP download.' });
    }
  }
};

// GET /api/live/permanent-qr
// Public/Admin: returns the permanent QR code pointing to the live sharing URL
export const getPermanentQRCode = async (req, res) => {
  try {
    const clientUrl = process.env.CLIENT_URL || 'https://5starcinematography.vercel.app';
    const permanentLiveUrl = `${clientUrl}/live`;

    // Generate high quality QR code data URL (PNG)
    const qrDataUrl = await QRCode.toDataURL(permanentLiveUrl, {
      errorCorrectionLevel: 'H',
      width: 600,
      margin: 2,
      color: {
        dark: '#0f0f12',
        light: '#f7df94' // Elegant champagne gold background for QR
      }
    });

    const qrSvg = await QRCode.toString(permanentLiveUrl, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 2
    });

    return res.status(200).json({
      success: true,
      liveUrl: permanentLiveUrl,
      qrDataUrl,
      qrSvg
    });
  } catch (error) {
    console.error('[QR Generation Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate permanent QR code.' });
  }
};

// POST /api/admin/live/start
// Admin: Start a new live event. Ensures only ONE active event exists!
export const startLiveEvent = async (req, res) => {
  try {
    const { name, category, eventDate, description } = req.body;

    if (!name || !category) {
      return res.status(400).json({ success: false, message: 'Event name and category are required.' });
    }

    // Safety: ensure any previously lingering active event is archived first
    const existingActive = await LiveEvent.findOne({ status: 'Active' });
    if (existingActive) {
      existingActive.status = 'Archived';
      existingActive.endedAt = new Date();
      await existingActive.save();
    }

    const newEvent = await LiveEvent.create({
      name: name.trim(),
      category: category.trim(),
      eventDate: eventDate ? new Date(eventDate) : new Date(),
      description: description || '',
      status: 'Active',
      startedAt: new Date(),
      currentSequence: 0,
      photoCount: 0,
      createdBy: req.user._id
    });

    return res.status(201).json({
      success: true,
      message: `Live event "${newEvent.name}" started successfully! Live guests can now scan the permanent QR code.`,
      event: newEvent
    });
  } catch (error) {
    console.error('[Start Live Event Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to start live event.' });
  }
};

// POST /api/admin/live/upload
// Admin: Upload multiple photos to the currently active event with sequence numbers 000001, 000002...
export const uploadLivePhotos = async (req, res) => {
  try {
    const activeEvent = await LiveEvent.findOne({ status: 'Active' });
    if (!activeEvent) {
      return res.status(400).json({
        success: false,
        message: 'No active event found. Please start a live event before uploading photos.'
      });
    }

    const files = req.files || (req.file ? [req.file] : []);
    if (files.length === 0) {
      return res.status(400).json({ success: false, message: 'No image files provided for upload.' });
    }

    const uploadedList = [];

    for (const file of files) {
      // Atomic increment sequence number
      const updatedEvent = await LiveEvent.findByIdAndUpdate(
        activeEvent._id,
        { $inc: { currentSequence: 1, photoCount: 1 } },
        { new: true }
      );

      const seqNumber = updatedEvent.currentSequence;
      const formattedSeq = formatSequence(seqNumber);

      const uploadResult = await uploadBufferToGridFS(
        file.buffer,
        file.originalname,
        file.mimetype,
        {
          context: 'live_event_photo',
          eventId: activeEvent._id.toString(),
          sequenceNumber: seqNumber,
          formattedSequence: formattedSeq
        }
      );

      const livePhoto = await LivePhoto.create({
        eventId: activeEvent._id,
        gridFsFileId: uploadResult.fileId,
        sequenceNumber: seqNumber,
        formattedSequence: formattedSeq,
        originalFilename: file.originalname,
        mimeType: file.mimetype,
        size: file.size
      });

      uploadedList.push({
        id: livePhoto._id,
        gridFsFileId: livePhoto.gridFsFileId,
        sequenceNumber: livePhoto.sequenceNumber,
        formattedSequence: livePhoto.formattedSequence,
        originalFilename: livePhoto.originalFilename,
        size: livePhoto.size,
        uploadedAt: livePhoto.uploadedAt
      });
    }

    return res.status(201).json({
      success: true,
      message: `Uploaded ${uploadedList.length} photo(s) to live event "${activeEvent.name}".`,
      photos: uploadedList
    });
  } catch (error) {
    console.error('[Upload Live Photos Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to upload photos: ' + error.message });
  }
};

// POST /api/admin/live/end
// Admin: End active event, marks Archived, preserves all photos and metadata in MongoDB
export const endLiveEvent = async (req, res) => {
  try {
    const activeEvent = await LiveEvent.findOne({ status: 'Active' });
    if (!activeEvent) {
      return res.status(400).json({ success: false, message: 'There is no currently active live event to end.' });
    }

    activeEvent.status = 'Archived';
    activeEvent.endedAt = new Date();
    await activeEvent.save();

    return res.status(200).json({
      success: true,
      message: `Event "${activeEvent.name}" ended and archived successfully. All ${activeEvent.photoCount} photos have been preserved in MongoDB Atlas. The permanent QR code is now ready for your next event.`,
      event: activeEvent
    });
  } catch (error) {
    console.error('[End Live Event Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to end live event.' });
  }
};

// GET /api/admin/live/archives
// Admin: Fetch list of archived past live events
export const getArchivedEvents = async (req, res) => {
  try {
    const archives = await LiveEvent.find({ status: 'Archived' }).sort({ endedAt: -1, createdAt: -1 });
    return res.status(200).json({ success: true, count: archives.length, archives });
  } catch (error) {
    console.error('[Get Archives Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch archived events.' });
  }
};

// GET /api/admin/live/archives/:eventId
// Admin: Fetch photos of a specific archived event
export const getArchivedEventPhotos = async (req, res) => {
  try {
    const event = await LiveEvent.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Archived event not found.' });
    }

    const photos = await LivePhoto.find({ eventId: event._id }).sort({ sequenceNumber: 1 });

    return res.status(200).json({
      success: true,
      event,
      photos
    });
  } catch (error) {
    console.error('[Get Archived Photos Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch archived photos.' });
  }
};
