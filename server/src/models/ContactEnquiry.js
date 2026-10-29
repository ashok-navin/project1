import mongoose from 'mongoose';

const contactEnquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Your name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Your email address is required'],
      trim: true,
      lowercase: true
    },
    mobile: {
      type: String,
      required: [true, 'Contact phone number is required'],
      trim: true
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true
    },
    message: {
      type: String,
      required: [true, 'Message content is required']
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Resolved'],
      default: 'New',
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

const ContactEnquiry = mongoose.model('ContactEnquiry', contactEnquirySchema);
export default ContactEnquiry;
