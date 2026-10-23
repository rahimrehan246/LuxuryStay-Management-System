import express from 'express';
import {
  getReservations,
  getReservationById,
  createReservation,
  updateReservationStatus,
  lookupReservation,
} from '../controllers/reservationController.mjs';
import { protect, authorize } from '../middleware/authMiddleware.mjs';

const router = express.Router();

// 1. PUBLIC ROUTES (Guest bina login kiye use karega)
router.post('/lookup', lookupReservation);
router.post('/', createReservation);

// 2. STAFF PROTECTED ROUTES (Inke liye staff login lazmi hai)
router.get(
  '/', 
  protect, 
  authorize('Admin', 'Manager', 'Receptionist'), 
  getReservations
);

router.get(
  '/:id', 
  protect, 
  getReservationById
);

router.patch(
  '/:id/status', 
  protect, 
  authorize('Admin', 'Manager', 'Receptionist'), 
  updateReservationStatus
);

export default router;