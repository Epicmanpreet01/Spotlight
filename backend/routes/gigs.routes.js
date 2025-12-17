import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { validateInput } from "../middleware/validation.middleware.js";
import {
  validGigFilterSchema,
  validGigSchema,
  validApplySchema,
  validCloseGigSchema,
} from "../models/validation.model.js";
import {
  getGigs,
  getGigById,
  createGig,
  updateGig,
  applyToGig,
  withdrawApplication,
  closeGig,
  deleteGig,
  getMyGigs,
} from "../controllers/gigs.controller.js";

import upload from "../middleware/upload.middleware.js";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize(["performer"]),
  validateInput(validGigFilterSchema, { mode: "query" }),
  getGigs
);

router.get("/:gigId", authenticate, authorize(["performer"]), getGigById);

router.post(
  "/create",
  authenticate,
  authorize(["booker"]),
  upload.single("previewImage"),
  validateInput(validGigSchema),
  createGig
);

router.put(
  "/update/:gigId",
  authenticate,
  authorize(["booker"]),
  upload.single("previewImage"),
  validateInput(validGigSchema),
  updateGig
);

router.delete("/delete/:gigId", authenticate, authorize(["booker"]), deleteGig);

router.post(
  "/:gigId/apply",
  authenticate,
  authorize(["performer"]),
  validateInput(validApplySchema),
  applyToGig
);

router.post(
  "/:gigId/withdraw",
  authenticate,
  authorize(["performer"]),
  withdrawApplication
);

router.put(
  "/close/:gigId",
  authenticate,
  authorize(["booker"]),
  validateInput(validCloseGigSchema),
  closeGig
);

router.get("/my", authenticate, authorize(["booker"]), getMyGigs);

export default router;
