import crypto from 'crypto';
import Gallery from '../models/Gallery.js';
import GalleryMedia from '../models/GalleryMedia.js';
import {
  uploadBufferToGridFS,
  deleteGridFSFile,
  streamZipArchive
} from '../services/gridfsService.js';

// Helper to generate a short, clean token (e.g. "arjun-meera" or "p-7a2b" or custom short extra word) instead of a long hash
const generateShortToken = (customWord = '', title = '') => {
  if (customWord && typeof customWord === 'string') {
    const cleanWord = customWord
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    if (cleanWord.length >= 2) {
      return cleanWord;
    }
  }
  // If title is available, generate clean short slug from title (e.g. "arjun-meera-9a")
  if (title && typeof title === 'string') {
    const titleWords = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .split(/\s+/)
      .filter((w) => !['the', 'and', 'at', 'in', 'of', 'for', 'with', 'a', 'an'].includes(w))
      .slice(0, 2)
      .join('-');
    if (titleWords.length >= 2) {
      const code = crypto.randomBytes(2).toString('hex'); // 4 hex chars
      return `${titleWords}-${code}`;
    }
  }
  const randomSuffix = crypto.randomBytes(2).toString('hex'); // 4 hex chars e.g. "p-8b2a"
  return `p-${randomSuffix}`;
};

// GET /api/galleries/admin/all
// Admin only: returns ALL galleries (both Public AND Private) with media counts
export const getAllGalleriesAdmin = async (req, res) => {
  try {
    const galleries = await Gallery.find().sort({ order: 1, createdAt: -1 });

    const galleriesWithCounts = await Promise.all(
      galleries.map(async (g) => {
        const mediaCount = await GalleryMedia.countDocuments({ galleryId: g._id });
        return {
          ...g.toObject(),
          mediaCount
        };
      })
    );

    return res.status(200).json({ success: true, count: galleriesWithCounts.length, galleries: galleriesWithCounts });
  } catch (error) {
    console.error('[Get Admin Galleries Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch galleries for admin.' });
  }
};

// GET /api/galleries/admin/:id
// Admin only: returns gallery details AND all media items regardless of visibility (Public or Private)
export const getGalleryByIdAdmin = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({ success: false, message: 'Gallery folder not found.' });
    }

    const media = await GalleryMedia.find({ galleryId: gallery._id }).sort({ sequenceNumber: 1, createdAt: 1 });

    return res.status(200).json({
      success: true,
      gallery,
      media
    });
  } catch (error) {
    console.error('[Get Admin Gallery By ID Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch gallery details for admin.' });
  }
};

// GET /api/galleries/public
export const getPublicGalleries = async (req, res) => {
  try {
    const galleries = await Gallery.find({ visibility: 'Public' })
      .sort({ order: 1, createdAt: -1 });

    // Attach item counts
    const galleriesWithCounts = await Promise.all(
      galleries.map(async (g) => {
        const mediaCount = await GalleryMedia.countDocuments({ galleryId: g._id });
        return {
          ...g.toObject(),
          mediaCount
        };
      })
    );

    return res.status(200).json({ success: true, count: galleriesWithCounts.length, galleries: galleriesWithCounts });
  } catch (error) {
    console.error('[Get Public Galleries Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch galleries.' });
  }
};

// GET /api/galleries/:id
export const getGalleryById = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({ success: false, message: 'Gallery folder not found.' });
    }

    // Check visibility if not admin
    if (gallery.visibility === 'Private' && (!req.user || req.user.role !== 'ADMIN')) {
      return res.status(403).json({ success: false, message: 'This gallery is private. Access requires a direct private link.' });
    }

    const media = await GalleryMedia.find({ galleryId: gallery._id }).sort({ sequenceNumber: 1, createdAt: 1 });

    return res.status(200).json({
      success: true,
      gallery,
      media
    });
  } catch (error) {
    console.error('[Get Gallery Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch gallery details.' });
  }
};

// GET /api/gallery/private/:token
export const getPrivateGalleryByToken = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Private access token is required.' });
    }

    const gallery = await Gallery.findOne({ privateAccessToken: token });
    if (!gallery) {
      return res.status(404).json({ success: false, message: 'Private gallery not found or access token has been revoked.' });
    }

    const media = await GalleryMedia.find({ galleryId: gallery._id }).sort({ sequenceNumber: 1, createdAt: 1 });

    return res.status(200).json({
      success: true,
      gallery,
      media
    });
  } catch (error) {
    console.error('[Private Gallery Access Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to access private gallery.' });
  }
};

// POST /api/admin/galleries
export const createGallery = async (req, res) => {
  try {
    const { title, description, category, visibility, downloadEnabled, eventDate, coverImageUrl, customToken } = req.body;

    if (!title || !category) {
      return res.status(400).json({ success: false, message: 'Title and category are required.' });
    }

    let coverImageFileId = null;
    if (req.file) {
      const uploadResult = await uploadBufferToGridFS(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        { context: 'gallery_cover', galleryTitle: title }
      );
      coverImageFileId = uploadResult.fileId;
    }

    const isPrivate = visibility === 'Private';
    const privateAccessToken = isPrivate ? generateShortToken(customToken) : null;

    const gallery = await Gallery.create({
      title: title.trim(),
      description: description || '',
      category: category.trim(),
      coverImageFileId,
      coverImageUrl: coverImageUrl || '',
      visibility: isPrivate ? 'Private' : 'Public',
      privateAccessToken,
      downloadEnabled: downloadEnabled !== undefined ? downloadEnabled === 'true' || downloadEnabled === true : true,
      eventDate: eventDate ? new Date(eventDate) : null
    });

    return res.status(201).json({
      success: true,
      message: 'Gallery folder created successfully.',
      gallery
    });
  } catch (error) {
    console.error('[Create Gallery Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to create gallery: ' + error.message });
  }
};

// PUT /api/admin/galleries/:id
export const updateGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({ success: false, message: 'Gallery not found.' });
    }

    const { title, description, category, visibility, downloadEnabled, eventDate, coverImageUrl, customToken } = req.body;

    if (title) gallery.title = title.trim();
    if (description !== undefined) gallery.description = description;
    if (category) gallery.category = category.trim();
    if (downloadEnabled !== undefined) gallery.downloadEnabled = downloadEnabled === 'true' || downloadEnabled === true;
    if (eventDate !== undefined) gallery.eventDate = eventDate ? new Date(eventDate) : null;
    if (coverImageUrl !== undefined) gallery.coverImageUrl = coverImageUrl;

    if (customToken) {
      gallery.privateAccessToken = generateShortToken(customToken);
    }

    if (visibility && visibility !== gallery.visibility) {
      gallery.visibility = visibility;
      if (visibility === 'Private' && !gallery.privateAccessToken) {
        gallery.privateAccessToken = generateShortToken(customToken);
      }
    }

    if (req.file) {
      if (gallery.coverImageFileId) {
        await deleteGridFSFile(gallery.coverImageFileId);
      }
      const uploadResult = await uploadBufferToGridFS(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        { context: 'gallery_cover', galleryTitle: gallery.title }
      );
      gallery.coverImageFileId = uploadResult.fileId;
    }

    await gallery.save();

    return res.status(200).json({
      success: true,
      message: 'Gallery updated successfully.',
      gallery
    });
  } catch (error) {
    console.error('[Update Gallery Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update gallery.' });
  }
};

// DELETE /api/admin/galleries/:id
export const deleteGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({ success: false, message: 'Gallery not found.' });
    }

    // Clean up cover image
    if (gallery.coverImageFileId) {
      await deleteGridFSFile(gallery.coverImageFileId);
    }

    // Find and delete all media files in GridFS
    const mediaItems = await GalleryMedia.find({ galleryId: gallery._id });
    for (const item of mediaItems) {
      if (item.gridFsFileId) {
        await deleteGridFSFile(item.gridFsFileId);
      }
      if (item.thumbnailFileId) {
        await deleteGridFSFile(item.thumbnailFileId);
      }
    }

    await GalleryMedia.deleteMany({ galleryId: gallery._id });
    await Gallery.findByIdAndDelete(gallery._id);

    return res.status(200).json({
      success: true,
      message: 'Gallery and all associated media files permanently removed from MongoDB.'
    });
  } catch (error) {
    console.error('[Delete Gallery Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete gallery.' });
  }
};

// POST /api/admin/galleries/:id/media
export const uploadGalleryMedia = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({ success: false, message: 'Gallery folder not found.' });
    }

    const files = req.files || (req.file ? [req.file] : []);
    if (files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select at least one media file to upload.' });
    }

    // Get latest sequence number
    const lastMedia = await GalleryMedia.findOne({ galleryId: gallery._id }).sort({ sequenceNumber: -1 });
    let currentSeq = lastMedia ? lastMedia.sequenceNumber : 0;

    const uploadedRecords = [];

    for (const file of files) {
      currentSeq += 1;
      const isVideo = file.mimetype.startsWith('video/');

      const uploadResult = await uploadBufferToGridFS(
        file.buffer,
        file.originalname,
        file.mimetype,
        {
          context: 'gallery_media',
          galleryId: gallery._id.toString(),
          sequenceNumber: currentSeq
        }
      );

      const mediaRecord = await GalleryMedia.create({
        galleryId: gallery._id,
        mediaType: isVideo ? 'video' : 'image',
        gridFsFileId: uploadResult.fileId,
        originalFilename: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        sequenceNumber: currentSeq,
        caption: req.body.caption || ''
      });

      uploadedRecords.push(mediaRecord);
    }

    return res.status(201).json({
      success: true,
      message: `Successfully uploaded ${uploadedRecords.length} media file(s).`,
      media: uploadedRecords
    });
  } catch (error) {
    console.error('[Upload Media Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to upload media: ' + error.message });
  }
};

// DELETE /api/admin/galleries/:id/media/:mediaId
export const deleteGalleryMediaItem = async (req, res) => {
  try {
    const media = await GalleryMedia.findOne({
      _id: req.params.mediaId,
      galleryId: req.params.id
    });

    if (!media) {
      return res.status(404).json({ success: false, message: 'Media item not found.' });
    }

    if (media.gridFsFileId) {
      await deleteGridFSFile(media.gridFsFileId);
    }
    if (media.thumbnailFileId) {
      await deleteGridFSFile(media.thumbnailFileId);
    }

    await GalleryMedia.findByIdAndDelete(media._id);

    return res.status(200).json({
      success: true,
      message: 'Media file removed successfully from storage and gallery.'
    });
  } catch (error) {
    console.error('[Delete Media Item Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete media item.' });
  }
};

// POST /api/admin/galleries/:id/regenerate-token
export const regenerateGalleryToken = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({ success: false, message: 'Gallery not found.' });
    }

    const { customToken } = req.body;
    gallery.privateAccessToken = generateShortToken(customToken);
    gallery.visibility = 'Private';
    await gallery.save();

    return res.status(200).json({
      success: true,
      message: 'New short private access link generated.',
      privateAccessToken: gallery.privateAccessToken
    });
  } catch (error) {
    console.error('[Regenerate Token Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to regenerate token.' });
  }
};

// GET /api/galleries/:id/download-zip
export const downloadGalleryZip = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({ success: false, message: 'Gallery not found.' });
    }

    // Check private token if private
    if (gallery.visibility === 'Private' && (!req.user || req.user.role !== 'ADMIN')) {
      const token = req.query.token;
      if (!token || token !== gallery.privateAccessToken) {
        return res.status(403).json({ success: false, message: 'Unauthorized to download private gallery.' });
      }
    }

    const mediaItems = await GalleryMedia.find({ galleryId: gallery._id });
    if (mediaItems.length === 0) {
      return res.status(400).json({ success: false, message: 'This gallery has no media files to download.' });
    }

    const fileEntries = mediaItems.map((m) => ({
      gridFsFileId: m.gridFsFileId,
      filename: `${m.sequenceNumber.toString().padStart(4, '0')}_${m.originalFilename}`
    }));

    const zipName = `5Star_${gallery.title.replace(/[^a-zA-Z0-9]/g, '_')}_Gallery.zip`;
    await streamZipArchive(fileEntries, zipName, res);
  } catch (error) {
    console.error('[Download Gallery Zip Error]:', error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: 'Failed to create ZIP download.' });
    }
  }
};
