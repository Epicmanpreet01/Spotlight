import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateInput } from "../middleware/validation.middleware.js";
import { validUserUpdatesSchema } from "../models/validation.model.js";
import {
  updateUserProfile,
  updateProfileImage,
  deleteProfileImage,
} from "../controllers/user.controller.js";
import upload from "../middleware/upload.middleware.js";

const router = Router();

router.put(
  "/updateUser",
  authenticate,
  validateInput(validUserUpdatesSchema, { mode: "body" }),
  updateUserProfile
);

router.put(
  "/updateUserImage",
  authenticate,
  upload.single("image"),
  updateProfileImage
);

router.delete("/deleteUserImage", authenticate, deleteProfileImage);

export default router;
