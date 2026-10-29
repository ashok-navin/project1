import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      default: '5Star Cinematography'
    },
    tagline: {
      type: String,
      default: 'Every Moment, A Timeless Story'
    },
    phone: {
      type: String,
      default: '+91 98765 43210'
    },
    email: {
      type: String,
      default: 'contact@5starcinematography.com'
    },
    address: {
      type: String,
      default: 'Studio 5, Luxury Arts Enclave, Jubilee Hills, Hyderabad, India'
    },
    permanentQrSlug: {
      type: String,
      default: '/live'
    },
    instagramUrl: {
      type: String,
      default: 'https://instagram.com/5star_cinematography'
    },
    youtubeUrl: {
      type: String,
      default: 'https://youtube.com/@5starcinematography'
    },
    facebookUrl: {
      type: String,
      default: 'https://facebook.com/5starcinematography'
    },
    whatsappNumber: {
      type: String,
      default: '+919876543210'
    }
  },
  {
    timestamps: true
  }
);

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);
export default SiteSettings;
