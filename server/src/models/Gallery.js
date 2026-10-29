import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Gallery title is required'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    coverImageFileId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    coverImageUrl: {
      type: String,
      default: ''
    },
    visibility: {
      type: String,
      enum: ['Public', 'Private'],
      default: 'Public',
      index: true
    },
    privateAccessToken: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    downloadEnabled: {
      type: Boolean,
      default: true
    },
    eventDate: {
      type: Date,
      default: null
    },
    order: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

gallerySchema.index({ visibility: 1, order: 1 });

const Gallery = mongoose.model('Gallery', gallerySchema);
export default Gallery;
