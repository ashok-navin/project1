import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: true,
      trim: true
    },
    eventType: {
      type: String,
      required: true,
      trim: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 5
    },
    review: {
      type: String,
      required: true
    },
    eventLocation: {
      type: String,
      default: ''
    },
    isPublished: {
      type: Boolean,
      default: true
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

const Testimonial = mongoose.model('Testimonial', testimonialSchema);
export default Testimonial;
