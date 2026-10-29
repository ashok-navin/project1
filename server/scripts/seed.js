import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import Package from '../src/models/Package.js';
import Gallery from '../src/models/Gallery.js';
import Testimonial from '../src/models/Testimonial.js';
import SiteSettings from '../src/models/SiteSettings.js';

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await connectDB();

    console.log('[Seed] Clearing existing packages, galleries, and testimonials...');
    await Package.deleteMany({});
    await Gallery.deleteMany({});
    await Testimonial.deleteMany({});
    await SiteSettings.deleteMany({});

    // 1. Initial 4 Packages as required by specification
    const samplePackages = [
      {
        name: 'Photography Only',
        description: 'Ideal for intimate ceremonies, registry weddings, or focused portrait sessions with dedicated high-resolution photography coverage.',
        price: 45000,
        features: [
          'Full-day professional candid and traditional photography coverage',
          'Lead senior photographer with dual flagship mirrorless cameras',
          '350+ color-graded and meticulously edited high-resolution photographs',
          'Secure high-speed digital cloud delivery with permanent gallery access',
          'Online private gallery for family and guest access',
          'Quick preview highlights delivered within 48 hours'
        ],
        addOns: [
          { name: 'Drone Aerial Photography', price: 12000 },
          { name: 'Handcrafted Premium Leather Photo Album (40 Pages)', price: 18000 },
          { name: 'Additional Photographer Coverage', price: 15000 }
        ],
        coverImageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
        isActive: true,
        isFeatured: false,
        order: 1
      },
      {
        name: 'Photography + Videography',
        description: 'Comprehensive coverage capturing every emotion in still portraits and motion film with dual camera cinematography teams.',
        price: 85000,
        features: [
          'Dual senior photographers (Candid + Traditional portraits)',
          'Senior cinematographer with cinema 4K stabilization gear',
          'Full event continuous video coverage (60-90 min traditional film)',
          '500+ color-graded edited high-resolution master photographs',
          'Audio recording of vows, ceremonies, and speeches',
          'Delivered on luxury wooden custom USB drive and digital cloud'
        ],
        addOns: [
          { name: '4K Drone Aerial Cinematography', price: 15000 },
          { name: 'Extra Premium Flush Mount Album', price: 16000 },
          { name: 'Same Day 60-Sec Instagram Reel Edit', price: 10000 }
        ],
        coverImageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
        isActive: true,
        isFeatured: true,
        order: 2
      },
      {
        name: 'Trailer + Photography + Videography',
        description: 'Our signature cinematic wedding package featuring a movie-like highlight trailer, teaser film, and complete photographic coverage.',
        price: 135000,
        features: [
          'Master cinematography crew with anamorphic lenses and gimbal rigs',
          'Breathtaking 3 to 5-minute Cinematic Wedding Highlight Trailer',
          '60-second viral Instagram teaser reel delivered within 72 hours',
          'Full traditional documentary video film (90+ mins in 4K UHD)',
          'Senior candid wedding photographer and traditional photographer',
          '700+ master edited high-resolution photographs',
          'Permanent live QR photo download access for wedding guests',
          'Luxury heirloom custom presentation box with twin photo books'
        ],
        addOns: [
          { name: 'Pre-Wedding Sunset Cinematic Shoot (1 Full Day)', price: 35000 },
          { name: 'Live Video Wall Streaming Setup', price: 25000 }
        ],
        coverImageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
        isActive: true,
        isFeatured: true,
        order: 3
      },
      {
        name: 'Premium Wedding Package (Royal Luxe)',
        description: 'The pinnacle luxury photography and cinematography experience with full-suite production, bespoke wedding books, calendar, diary, and frames.',
        price: 210000,
        features: [
          'Complete 4-member elite photography and cinematography crew',
          'Cinematic wedding trailer (4K cinema grading with licensed music)',
          'Full documentary multi-camera event video coverage',
          'Bespoke Personalized Event Calendar (12 Months)',
          'Custom foil-embossed Keepsake Wedding Diary',
          '2 Large Museum-grade Acrylic Printed Wall Photo Frames (24x36)',
          '2 Deluxe Italian Leather Handcrafted Flush-mount Albums (50 pages each)',
          'Licensed 4K drone cinematography coverage',
          'Instant live guest QR photo distribution during the event',
          'Unlimited edited high-resolution photos and raw footage archive'
        ],
        addOns: [
          { name: 'Destination Pre-Wedding Film (2 Days)', price: 50000 },
          { name: '360-Degree Video Booth Experience', price: 30000 }
        ],
        coverImageUrl: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=80',
        isActive: true,
        isFeatured: true,
        order: 4
      }
    ];

    await Package.insertMany(samplePackages);
    console.log('[Seed] 4 Signature photography packages created.');

    // 2. Initial Sample Gallery Folders
    const sampleGalleries = [
      {
        title: 'The Royal Heritage Wedding: Arjun & Meera',
        description: 'A magnificent three-day royal wedding at Taj Falaknuma Palace capturing regal moments, emotions, and fireworks.',
        category: 'Wedding Photography',
        visibility: 'Public',
        coverImageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
        eventDate: new Date('2026-02-14'),
        downloadEnabled: true,
        order: 1
      },
      {
        title: 'Golden Sunset Pre-Wedding: Rohan & Tanvi',
        description: 'Dreamy golden hour portraits against historic arches, lakeside breezes, and dusk lanterns.',
        category: 'Pre-Wedding Shoot',
        visibility: 'Public',
        coverImageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
        eventDate: new Date('2026-03-01'),
        downloadEnabled: true,
        order: 2
      },
      {
        title: 'Grand Starlight Reception: Siddharth & Ananya',
        description: 'A lavish reception celebration filled with music, champagne toasts, and heartfelt dance performances.',
        category: 'Reception',
        visibility: 'Public',
        coverImageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
        eventDate: new Date('2026-01-20'),
        downloadEnabled: true,
        order: 3
      },
      {
        title: 'Cinematic Wedding Highlight Reels',
        description: 'Award-winning 4K cinema films and teaser trailers captured across destination ceremonies.',
        category: 'Cinematic Trailers',
        visibility: 'Public',
        coverImageUrl: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=80',
        eventDate: new Date('2026-02-28'),
        downloadEnabled: true,
        order: 4
      }
    ];

    await Gallery.insertMany(sampleGalleries);
    console.log('[Seed] Sample portfolio gallery folders created.');

    // 3. Testimonials
    const sampleTestimonials = [
      {
        clientName: 'Priya & Vikram Nair',
        eventType: 'Wedding & Reception',
        rating: 5,
        review: '5Star Cinematography brought our dream wedding to life! The cinematic trailer literally moved our families to tears. The team was discreet, polite, and captured the most genuine smiles.',
        eventLocation: 'Hyderabad',
        isPublished: true,
        order: 1
      },
      {
        clientName: 'Aditi & Karan Singhania',
        eventType: 'Destination Wedding',
        rating: 5,
        review: 'The live QR photo feature was the talk of our wedding! Our guests were astonished that they could scan a QR code at their dinner table and download gorgeous high-res photos within an hour of our garland exchange.',
        eventLocation: 'Udaipur',
        isPublished: true,
        order: 2
      },
      {
        clientName: 'Dr. Rahul & Sneha Varma',
        eventType: 'Pre-Wedding & Engagement',
        rating: 5,
        review: 'From initial booking to our handcrafted Italian leather album delivery, the 5Star team delivered pure luxury. The lighting and color grading look like a high-budget Bollywood production.',
        eventLocation: 'Bengaluru',
        isPublished: true,
        order: 3
      }
    ];

    await Testimonial.insertMany(sampleTestimonials);
    console.log('[Seed] Testimonials created.');

    // 4. Site Settings
    await SiteSettings.create({
      businessName: '5Star Cinematography',
      tagline: 'Every Moment, A Timeless Story',
      phone: '+91 98765 43210',
      email: 'contact@5starcinematography.com',
      address: 'Studio 5, Luxury Arts Enclave, Jubilee Hills, Hyderabad, India',
      permanentQrSlug: '/live'
    });
    console.log('[Seed] Site settings created.');

    console.log('-----------------------------------------------------');
    console.log('[Success] Database seeded successfully!');
    console.log('-----------------------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('[Error] Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
