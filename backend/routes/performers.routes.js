import { Router } from "express";
import {
  authenticate,
  authorize,
  tieredAuthentication,
} from "../middleware/auth.middleware.js";
import {
  getPerformers,
  getPerformerById,
  updatePerformerProfile,
  addGalleryImages,
  removeGalleryImage,
} from "../controllers/performers.controller.js";
import { validateInput } from "../middleware/validation.middleware.js";
import {
  validFilterSchema,
  validPerformerUpdatesSchema,
} from "../models/validation.model.js";
import upload from "../middleware/upload.middleware.js";

const router = Router();

router.get(
  "/",
  tieredAuthentication,
  validateInput(validFilterSchema, { mode: "query" }),
  getPerformers
);

router.get("/:id", tieredAuthentication, getPerformerById);

router.put(
  "/profile",
  authenticate,
  authorize(["performer"]),
  validateInput(validPerformerUpdatesSchema, { mode: "body" }),
  updatePerformerProfile
);

router.put(
  "/profile/add/images",
  authenticate,
  authorize(["performer"]),
  upload.array("images", 10), // max 10 images
  addGalleryImages
);

router.post(
  "/profile/delete/image",
  authenticate,
  authorize(["performer"]),
  removeGalleryImage
);

export default router;
