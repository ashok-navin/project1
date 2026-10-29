import crypto from 'crypto';
import Booking from '../models/Booking.js';
import Package from '../models/Package.js';
import User from '../models/User.js';
import Gallery from '../models/Gallery.js';
import LiveEvent from '../models/LiveEvent.js';
import {
  sendBookingCustomerConfirmation,
  sendBookingAdminNotification,
  sendBookingStatusUpdate
} from '../services/emailService.js';

// Helper to generate a unique booking reference
const generateBookingReference = () => {
  const year = new Date().getFullYear();
  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `5STAR-BK-${year}-${randomSuffix}`;
};

// POST /api/bookings
export const createBooking = async (req, res) => {
  try {
    const {
      customerDetails,
      eventDetails,
      packageId,
      additionalServices
    } = req.body;

    if (!customerDetails || !eventDetails || !packageId) {
      return res.status(400).json({ success: false, message: 'Customer details, event details, and package selection are required.' });
    }

    // Validate event date (cannot be in the past)
    const eventDate = new Date(eventDetails.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(eventDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid event date provided.' });
    }

    if (eventDate < today) {
      return res.status(400).json({ success: false, message: 'Event date cannot be in the past.' });
    }

    // Fetch and snapshot package
    const pkg = await Package.findById(packageId);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Selected package was not found.' });
    }

    let calculatedPrice = pkg.price;
    const selectedAddOns = additionalServices || [];

    // Tally add-on prices if applicable
    if (Array.isArray(selectedAddOns) && pkg.addOns && pkg.addOns.length > 0) {
      selectedAddOns.forEach((addonName) => {
        const found = pkg.addOns.find((a) => a.name === addonName);
        if (found) {
          calculatedPrice += found.price;
        }
      });
    }

    // Generate unique reference
    let bookingReference = generateBookingReference();
    let collisionCheck = await Booking.findOne({ bookingReference });
    while (collisionCheck) {
      bookingReference = generateBookingReference();
      collisionCheck = await Booking.findOne({ bookingReference });
    }

    const booking = await Booking.create({
      bookingReference,
      userId: req.user._id,
      customerDetails: {
        fullName: customerDetails.fullName || req.user.name,
        email: customerDetails.email || req.user.email,
        primaryMobile: customerDetails.primaryMobile || req.user.mobile,
        alternateMobile: customerDetails.alternateMobile || '',
        fullAddress: customerDetails.fullAddress,
        city: customerDetails.city,
        state: customerDetails.state,
        postalCode: customerDetails.postalCode
      },
      eventDetails: {
        eventType: eventDetails.eventType,
        eventDate,
        startTime: eventDetails.startTime,
        endTime: eventDetails.endTime || '',
        venueName: eventDetails.venueName,
        fullAddress: eventDetails.fullAddress,
        expectedGuests: Number(eventDetails.expectedGuests || 0),
        specialRequirements: eventDetails.specialRequirements || '',
        preferredContact: eventDetails.preferredContact || 'WhatsApp'
      },
      packageId: pkg._id,
      packageSnapshot: {
        name: pkg.name,
        price: pkg.price,
        features: pkg.features
      },
      additionalServices: selectedAddOns,
      totalQuotedPrice: calculatedPrice,
      bookingStatus: 'Pending'
    });

    // Send emails asynchronously
    sendBookingCustomerConfirmation(booking).catch(err => console.error('Customer email failed:', err));
    sendBookingAdminNotification(booking).catch(err => console.error('Admin email failed:', err));

    return res.status(201).json({
      success: true,
      message: 'Event booking inquiry submitted successfully!',
      booking
    });
  } catch (error) {
    console.error('[Create Booking Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit booking: ' + error.message });
  }
};

// GET /api/bookings/my
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('packageId', 'name price')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    console.error('[Get My Bookings Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch your bookings.' });
  }
};

// GET /api/bookings/:id
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('packageId');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Ensure customer can only view their own booking (admins can view any)
    if (req.user.role !== 'ADMIN' && booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied to this booking.' });
    }

    // Do not leak admin notes to customer
    const bookingData = booking.toObject();
    if (req.user.role !== 'ADMIN') {
      delete bookingData.adminNotes;
    }

    return res.status(200).json({ success: true, booking: bookingData });
  } catch (error) {
    console.error('[Get Booking Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch booking.' });
  }
};

// GET /api/admin/bookings
export const getAllBookings = async (req, res) => {
  try {
    const { status, eventType, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.bookingStatus = status;
    }

    if (eventType && eventType !== 'All') {
      filter['eventDetails.eventType'] = eventType;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { bookingReference: regex },
        { 'customerDetails.fullName': regex },
        { 'customerDetails.email': regex },
        { 'customerDetails.primaryMobile': regex },
        { 'eventDetails.venueName': regex }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .populate('userId', 'name email mobile')
      .populate('packageId', 'name price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      bookings
    });
  } catch (error) {
    console.error('[Get All Bookings Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch bookings.' });
  }
};

// PATCH /api/admin/bookings/:id/status
export const updateBookingStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'Rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const prevStatus = booking.bookingStatus;
    booking.bookingStatus = status;
    if (adminNotes !== undefined) {
      booking.adminNotes = adminNotes;
    }

    await booking.save();

    // Notify customer if status changed to Confirmed, Completed, Cancelled, or Rejected
    if (prevStatus !== status && ['Confirmed', 'Completed', 'Cancelled', 'Rejected'].includes(status)) {
      sendBookingStatusUpdate(booking).catch(err => console.error('Status email failed:', err));
    }

    return res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}.`,
      booking
    });
  } catch (error) {
    console.error('[Update Booking Status Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update booking status.' });
  }
};

// PATCH /api/admin/bookings/:id/notes
export const updateBookingNotes = async (req, res) => {
  try {
    const { adminNotes } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { adminNotes: adminNotes || '' },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Admin notes saved.',
      booking
    });
  } catch (error) {
    console.error('[Update Notes Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update notes.' });
  }
};

// GET /api/admin/calendar
export const getAdminCalendar = async (req, res) => {
  try {
    const bookings = await Booking.find({
      bookingStatus: { $ne: 'Cancelled' }
    })
      .select('bookingReference eventDetails bookingStatus totalQuotedPrice customerDetails')
      .sort({ 'eventDetails.eventDate': 1 });

    // Group by date to detect scheduling conflicts
    const eventsByDate = {};
    const conflictDates = [];

    bookings.forEach((b) => {
      const dateKey = new Date(b.eventDetails.eventDate).toISOString().split('T')[0];
      if (!eventsByDate[dateKey]) {
        eventsByDate[dateKey] = [];
      }
      eventsByDate[dateKey].push(b);
      if (eventsByDate[dateKey].length > 1 && !conflictDates.includes(dateKey)) {
        conflictDates.push(dateKey);
      }
    });

    return res.status(200).json({
      success: true,
      bookings,
      conflictDates,
      totalEvents: bookings.length
    });
  } catch (error) {
    console.error('[Calendar Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch calendar.' });
  }
};

// GET /api/admin/dashboard/stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ bookingStatus: 'Pending' });
    const confirmedBookings = await Booking.countDocuments({ bookingStatus: 'Confirmed' });
    const completedEvents = await Booking.countDocuments({ bookingStatus: 'Completed' });
    const registeredCustomers = await User.countDocuments({ role: 'CUSTOMER' });
    const activePackages = await Package.countDocuments({ isActive: true });
    const galleryFolders = await Gallery.countDocuments();

    // Check currently active live photo event
    const activeLiveEvent = await LiveEvent.findOne({ status: 'Active' });

    // Recent 5 bookings
    const recentBookings = await Booking.find()
      .select('bookingReference customerDetails eventDetails bookingStatus totalQuotedPrice createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Next 5 upcoming confirmed or pending events
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingEvents = await Booking.find({
      'eventDetails.eventDate': { $gte: today },
      bookingStatus: { $in: ['Pending', 'Confirmed', 'In Progress'] }
    })
      .select('bookingReference customerDetails eventDetails bookingStatus')
      .sort({ 'eventDetails.eventDate': 1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      stats: {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedEvents,
        registeredCustomers,
        activePackages,
        galleryFolders,
        hasActiveLiveEvent: !!activeLiveEvent,
        activeLiveEventName: activeLiveEvent ? activeLiveEvent.name : null,
        activeLiveEventId: activeLiveEvent ? activeLiveEvent._id : null
      },
      recentBookings,
      upcomingEvents
    });
  } catch (error) {
    console.error('[Dashboard Stats Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats.' });
  }
};
