import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Package name is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Package description is required']
    },
    price: {
      type: Number,
      required: [true, 'Price in INR is required'],
      min: [0, 'Price must be a positive number']
    },
    features: {
      type: [String],
      default: []
    },
    addOns: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 }
      }
    ],
    coverImageFileId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    coverImageUrl: {
      type: String,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isFeatured: {
      type: Boolean,
      default: false
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

packageSchema.index({ isActive: 1, order: 1 });

const Package = mongoose.model('Package', packageSchema);
export default Package;
