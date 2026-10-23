import express from 'express';
import {
  createServiceRequest,
  getServiceRequests,
  updateServiceRequestStatus,
} from '../controllers/serviceRequestController.mjs';
import { protect, authorize } from '../middleware/authMiddleware.mjs';

const router = express.Router();

// 1. PUBLIC: Guest website se bina token request bhej sake
router.post('/', createServiceRequest);

// 2. STAFF ONLY: Protected routes
router.get(
  '/',
  protect,
  authorize('Admin', 'Manager', 'Receptionist', 'Housekeeping'),
  getServiceRequests
);

router.patch(
  '/:id/status',
  protect,
  authorize('Admin', 'Manager', 'Receptionist', 'Housekeeping'),
  updateServiceRequestStatus
);

export default router;