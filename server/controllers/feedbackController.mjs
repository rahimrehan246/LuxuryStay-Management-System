import Feedback from '../models/Feedback.mjs';
import { notifyMultipleRoles } from './notificationController.mjs';

// @desc    Submit guest feedback
// @route   POST /api/feedback
// @access  Public
export const createFeedback = async (req, res) => {
  try {
    const { guestName, email, rating, comment, roomNumber, bookingId } = req.body;

    if (!rating) {
      return res.status(400).json({ message: 'Rating is required (1 to 5 stars).' });
    }

    const feedback = await Feedback.create({
      guestName: guestName || 'Anonymous Guest',
      email: email || '',
      roomNumber: roomNumber || 'N/A',
      bookingId: bookingId || '',
      rating: Number(rating),
      comment: comment || '',
    });

    // Notify Management & Receptionist
    try {
      await notifyMultipleRoles(
        ['Admin', 'Manager', 'Receptionist'],
        `New ${rating}★ Feedback from ${feedback.guestName} (Room ${feedback.roomNumber})`,
        'Feedback',
        '/feedback'
      );
    } catch (nErr) {
      console.warn('Feedback notification skipped:', nErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for your valuable feedback!',
      feedback,
    });
  } catch (error) {
    console.error('Error submitting feedback:', error.message);
    res.status(500).json({ message: 'Server error submitting feedback' });
  }
};

// @desc    Get all feedback reviews
// @route   GET /api/feedback
// @access  Private (Admin, Manager, Receptionist)
export const getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({}).sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedback:', error.message);
    res.status(500).json({ message: 'Server error fetching feedback' });
  }
};

// @desc    Delete feedback review
// @route   DELETE /api/feedback/:id
// @access  Private (Admin only)
export const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    res.json({ message: 'Feedback removed successfully' });
  } catch (error) {
    console.error('Error deleting feedback:', error.message);
    res.status(500).json({ message: 'Server error deleting feedback' });
  }
};