import mongoose from 'mongoose';

const liveEventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Live event name is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Event category is required'],
      trim: true
    },
    eventDate: {
      type: Date,
      required: [true, 'Event date is required'],
      default: Date.now
    },
    description: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Active', 'Archived'],
      default: 'Active',
      index: true
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    endedAt: {
      type: Date,
      default: null
    },
    currentSequence: {
      type: Number,
      default: 0
    },
    photoCount: {
      type: Number,
      default: 0
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

const LiveEvent = mongoose.model('LiveEvent', liveEventSchema);
export default LiveEvent;
