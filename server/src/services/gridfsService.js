import mongoose from 'mongoose';
import { Readable } from 'stream';
import { getGridFSBucket } from '../config/db.js';
import archiver from 'archiver';

/**
 * Upload a Buffer directly to MongoDB Atlas GridFS
 */
export const uploadBufferToGridFS = async (buffer, filename, mimeType, metadata = {}) => {
  const bucket = getGridFSBucket();
  const safeFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

  return new Promise((resolve, reject) => {
    const readableStream = Readable.from(buffer);
    const uploadStream = bucket.openUploadStream(safeFilename, {
      contentType: mimeType,
      metadata: {
        ...metadata,
        uploadedAt: new Date(),
        originalFilename: filename
      }
    });

    readableStream.pipe(uploadStream)
      .on('error', (err) => reject(err))
      .on('finish', () => {
        resolve({
          fileId: uploadStream.id,
          filename: safeFilename,
          length: buffer.length,
          contentType: mimeType
        });
      });
  });
};

/**
 * Get file metadata from GridFS files collection
 */
export const getGridFSFileInfo = async (fileId) => {
  const objectId = typeof fileId === 'string' ? new mongoose.Types.ObjectId(fileId) : fileId;
  const bucket = getGridFSBucket();
  const files = await bucket.find({ _id: objectId }).toArray();
  if (!files || files.length === 0) {
    return null;
  }
  return files[0];
};

/**
 * Stream a file from GridFS to HTTP response, supporting HTTP 206 Range for Videos
 */
export const streamFileToResponse = async (fileId, req, res, asDownload = false, customDownloadName = null) => {
  try {
    const fileInfo = await getGridFSFileInfo(fileId);
    if (!fileInfo) {
      return res.status(404).json({ success: false, message: 'Media file not found in storage' });
    }

    const bucket = getGridFSBucket();
    const contentType = fileInfo.contentType || 'application/octet-stream';
    const fileSize = fileInfo.length;

    const downloadFilename = customDownloadName || fileInfo.metadata?.originalFilename || fileInfo.filename;

    if (asDownload) {
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(downloadFilename)}"`);
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', fileSize);
      const downloadStream = bucket.openDownloadStream(fileInfo._id);
      return downloadStream.pipe(res);
    }

    // Video Streaming with HTTP Range requests
    const range = req.headers.range;
    if (range && contentType.startsWith('video/')) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = (end - start) + 1;

      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Content-Length', chunkSize);
      res.setHeader('Content-Type', contentType);

      const downloadStream = bucket.openDownloadStream(fileInfo._id, {
        start,
        end: end + 1
      });
      return downloadStream.pipe(res);
    }

    // Normal media display
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', fileSize);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day

    const downloadStream = bucket.openDownloadStream(fileInfo._id);
    return downloadStream.pipe(res);
  } catch (error) {
    console.error('[GridFS Stream Error]:', error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: 'Failed to stream media file' });
    }
  }
};

/**
 * Delete a file from GridFS
 */
export const deleteGridFSFile = async (fileId) => {
  try {
    if (!fileId) return false;
    const objectId = typeof fileId === 'string' ? new mongoose.Types.ObjectId(fileId) : fileId;
    const bucket = getGridFSBucket();
    await bucket.delete(objectId);
    return true;
  } catch (error) {
    console.warn(`[GridFS Delete Warning] Failed to delete file ${fileId}:`, error.message);
    return false;
  }
};

/**
 * Stream multiple GridFS files as a single ZIP archive to the response
 */
export const streamZipArchive = async (fileEntries, zipFilename, res) => {
  const bucket = getGridFSBucket();
  const archive = archiver('zip', {
    zlib: { level: 6 } // Good compression balance
  });

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(zipFilename)}"`);

  archive.pipe(res);

  archive.on('error', (err) => {
    console.error('[Archive Error]:', err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Archive generation failed' });
    }
  });

  for (const entry of fileEntries) {
    try {
      const fileInfo = await getGridFSFileInfo(entry.gridFsFileId);
      if (fileInfo) {
        const stream = bucket.openDownloadStream(fileInfo._id);
        const entryName = entry.filename || fileInfo.metadata?.originalFilename || fileInfo.filename;
        archive.append(stream, { name: entryName });
      }
    } catch (err) {
      console.warn(`[Zip entry skipped] ${entry.gridFsFileId}:`, err.message);
    }
  }

  await archive.finalize();
};
