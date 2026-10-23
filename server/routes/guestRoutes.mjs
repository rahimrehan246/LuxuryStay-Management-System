import express from 'express';
import {
  getGuests,
  getGuestById,
  createGuest,
  updateGuest,
  deleteGuest,
} from '../controllers/guestController.mjs';
import { protect, authorize } from '../middleware/authMiddleware.mjs';

const router = express.Router();

// Routes for /api/guests
// POST ko public rakha hai taake bina login ke guest ban sake
router
  .route('/')
  .get(protect, authorize('Admin', 'Manager', 'Receptionist'), getGuests)
  .post(createGuest);

// Routes for /api/guests/:id (Staff protected)
router
  .route('/:id')
  .get(protect, authorize('Admin', 'Manager', 'Receptionist'), getGuestById)
  .put(protect, authorize('Admin', 'Manager', 'Receptionist'), updateGuest)
  .delete(protect, authorize('Admin'), deleteGuest);

export default router;