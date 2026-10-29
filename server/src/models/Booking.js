import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    customerDetails: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      primaryMobile: { type: String, required: true },
      alternateMobile: { type: String, default: '' },
      fullAddress: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true }
    },
    eventDetails: {
      eventType: {
        type: String,
        required: true,
        enum: [
          'Wedding',
          'Reception',
          'Engagement',
          'Pre-Wedding',
          'Birthday',
          'Baby Shower',
          'Puberty Ceremony',
          'Corporate Event',
          'Other'
        ]
      },
      eventDate: { type: Date, required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, default: '' },
      venueName: { type: String, required: true },
      fullAddress: { type: String, required: true },
      expectedGuests: { type: Number, default: 0 },
      specialRequirements: { type: String, default: '' },
      preferredContact: {
        type: String,
        enum: ['Phone Call', 'WhatsApp', 'Email'],
        default: 'WhatsApp'
      }
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
      required: true
    },
    packageSnapshot: {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      features: { type: [String], default: [] }
    },
    additionalServices: {
      type: [String],
      default: []
    },
    totalQuotedPrice: {
      type: Number,
      required: true
    },
    bookingStatus: {
      type: String,
      enum: ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'Rejected'],
      default: 'Pending',
      index: true
    },
    adminNotes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

bookingSchema.index({ 'eventDetails.eventDate': 1, bookingStatus: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
