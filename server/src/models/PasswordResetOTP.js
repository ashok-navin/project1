import mongoose from 'mongoose';

const passwordResetOTPSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    otpHash: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // TTL index automatically cleans up expired records
    },
    attempts: {
      type: Number,
      default: 0
    },
    isConsumed: {
      type: Boolean,
      default: false
    },
    consumedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const PasswordResetOTP = mongoose.model('PasswordResetOTP', passwordResetOTPSchema);
export default PasswordResetOTP;
