import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { validateInput } from "../middleware/validation.middleware.js";
import { validReviewSchema } from "../models/validation.model.js";

import {
  createReview,
  updateReview,
  deleteReview,
  getReviewsForPerformer,
} from "../controllers/review.controller.js";

const router = Router();

router.post(
  "/booking/:bookingId",
  authenticate,
  authorize(["booker"]),
  validateInput(validReviewSchema),
  createReview
);

router.put(
  "/:reviewId",
  authenticate,
  authorize(["booker"]),
  validateInput(validReviewSchema),
  updateReview
);

router.delete("/:reviewId", authenticate, authorize(["booker"]), deleteReview);

router.get("/performer/:performerId", authenticate, getReviewsForPerformer);

export default router;
