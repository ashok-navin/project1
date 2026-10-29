import multer from 'multer';

// Use memory storage to stream directly into MongoDB Atlas GridFS
const storage = multer.memoryStorage();

const allowedMimeTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/webm',
  'video/quicktime'
];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed types: JPEG, PNG, WebP, MP4, WebM.`), false);
  }
};

export const uploadMedia = multer({
  storage,
  limits: {
    fileSize: 200 * 1024 * 1024 // 200MB limit
  },
  fileFilter
});

export const uploadPhotosOnly = multer({
  storage,
  limits: {
    fileSize: 40 * 1024 * 1024 // 40MB limit for high-res images
  },
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, and WebP images are permitted for live events.'), false);
    }
  }
});
