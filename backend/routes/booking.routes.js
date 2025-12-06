import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { validateInput } from "../middleware/validation.middleware.js";

import {
  createBooking,
  acceptBooking,
  declineBooking,
  confirmBooking,
  completeBooking,
  cancelBooking,
  getMyBookings,
} from "../controllers/booking.controller.js";

import { validBookingCreateSchema } from "../models/validation.model.js";

const router = Router();

router.post(
  "/create",
  authenticate,
  authorize(["booker"]),
  validateInput(validBookingCreateSchema),
  createBooking
);

router.get("/my-bookings", authenticate, getMyBookings);

router.put(
  "/:id/accept",
  authenticate,
  authorize(["performer"]),
  acceptBooking
);
router.put(
  "/:id/decline",
  authenticate,
  authorize(["performer"]),
  declineBooking
);

router.put("/:id/confirm", authenticate, authorize(["booker"]), confirmBooking);

router.put(
  "/:id/complete",
  authenticate,
  authorize(["performer"]),
  completeBooking
);

router.put("/:id/cancel", authenticate, cancelBooking);

export default router;
