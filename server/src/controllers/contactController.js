import ContactEnquiry from '../models/ContactEnquiry.js';
import { sendContactEnquiryAlert } from '../services/emailService.js';

// POST /api/contact
export const submitContactEnquiry = async (req, res) => {
  try {
    const { name, email, mobile, subject, message } = req.body;

    if (!name || !email || !mobile || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All form fields are required.' });
    }

    const enquiry = await ContactEnquiry.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      mobile: mobile.trim(),
      subject: subject.trim(),
      message: message.trim()
    });

    // Send email alert to admin asynchronously
    sendContactEnquiryAlert(enquiry).catch(err => console.error('Enquiry email failed:', err));

    return res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! We have received your inquiry and will connect with you shortly.'
    });
  } catch (error) {
    console.error('[Contact Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit enquiry. Please try again.' });
  }
};

// GET /api/admin/enquiries
export const getEnquiries = async (req, res) => {
  try {
    const enquiries = await ContactEnquiry.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: enquiries.length, enquiries });
  } catch (error) {
    console.error('[Get Enquiries Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch enquiries.' });
  }
};

// PATCH /api/admin/enquiries/:id
export const updateEnquiryStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const enquiry = await ContactEnquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found.' });
    }

    if (status) enquiry.status = status;
    if (adminNotes !== undefined) enquiry.adminNotes = adminNotes;

    await enquiry.save();

    return res.status(200).json({ success: true, message: 'Enquiry updated.', enquiry });
  } catch (error) {
    console.error('[Update Enquiry Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update enquiry.' });
  }
};
