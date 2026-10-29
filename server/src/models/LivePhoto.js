import mongoose from 'mongoose';

const livePhotoSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LiveEvent',
      required: true,
      index: true
    },
    gridFsFileId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    thumbnailFileId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    sequenceNumber: {
      type: Number,
      required: true
    },
    formattedSequence: {
      type: String,
      required: true
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
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

livePhotoSchema.index({ eventId: 1, sequenceNumber: 1 });

const LivePhoto = mongoose.model('LivePhoto', livePhotoSchema);
export default LivePhoto;
