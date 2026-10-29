import mongoose from 'mongoose';

const galleryMediaSchema = new mongoose.Schema(
  {
    galleryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gallery',
      required: true,
      index: true
    },
    mediaType: {
      type: String,
      enum: ['image', 'video'],
      default: 'image'
    },
    gridFsFileId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    thumbnailFileId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    originalFilename: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    sequenceNumber: {
      type: Number,
      default: 1
    },
    caption: {
      type: String,
      default: ''
    },
    downloadEnabled: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

galleryMediaSchema.index({ galleryId: 1, sequenceNumber: 1 });

const GalleryMedia = mongoose.model('GalleryMedia', galleryMediaSchema);
export default GalleryMedia;
