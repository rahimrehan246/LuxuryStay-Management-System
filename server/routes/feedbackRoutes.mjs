import express from 'express';
import {
  createFeedback,
  getAllFeedback,
  deleteFeedback,
} from '../controllers/feedbackController.mjs';
import { protect, authorize } from '../middleware/authMiddleware.mjs';

const router = express.Router();

// 1. PUBLIC: Feedback create karna aur website par show karne ke liye read karna
router.post('/', createFeedback);
router.get('/', getAllFeedback); // <--- Public Access for Website Display

// 2. STAFF ONLY: Delete feedback review
router.delete('/:id', protect, authorize('Admin'), deleteFeedback);

export default router;