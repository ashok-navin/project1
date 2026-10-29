import Testimonial from '../models/Testimonial.js';

// GET /api/testimonials
export const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isPublished: true }).sort({ order: 1, createdAt: -1 });
    return res.status(200).json({ success: true, count: testimonials.length, testimonials });
  } catch (error) {
    console.error('[Get Testimonials Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch testimonials.' });
  }
};

// GET /api/admin/testimonials
export const getAllTestimonialsAdmin = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ order: 1, createdAt: -1 });
    return res.status(200).json({ success: true, testimonials });
  } catch (error) {
    console.error('[Get Admin Testimonials Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch testimonials.' });
  }
};

// POST /api/admin/testimonials
export const createTestimonial = async (req, res) => {
  try {
    const { clientName, eventType, rating, review, eventLocation, isPublished, order } = req.body;
    if (!clientName || !eventType || !review) {
      return res.status(400).json({ success: false, message: 'Client name, event type, and review are required.' });
    }

    const testimonial = await Testimonial.create({
      clientName: clientName.trim(),
      eventType: eventType.trim(),
      rating: rating ? Number(rating) : 5,
      review: review.trim(),
      eventLocation: eventLocation || '',
      isPublished: isPublished !== undefined ? isPublished : true,
      order: order ? Number(order) : 0
    });

    return res.status(201).json({ success: true, message: 'Testimonial added.', testimonial });
  } catch (error) {
    console.error('[Create Testimonial Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to add testimonial.' });
  }
};

// PUT /api/admin/testimonials/:id
export const updateTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found.' });
    }
    return res.status(200).json({ success: true, message: 'Testimonial updated.', testimonial });
  } catch (error) {
    console.error('[Update Testimonial Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update testimonial.' });
  }
};

// DELETE /api/admin/testimonials/:id
export const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found.' });
    }
    return res.status(200).json({ success: true, message: 'Testimonial deleted.' });
  } catch (error) {
    console.error('[Delete Testimonial Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete testimonial.' });
  }
};
