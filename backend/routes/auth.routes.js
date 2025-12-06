import { Router } from "express";

import { signup, login, me, logout } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateInput } from "../middleware/validation.middleware.js";
import {
  validLoginSchema,
  validSignupSchema,
} from "../models/validation.model.js";

const router = Router();

router.post("/signup", validateInput(validSignupSchema), signup);
router.post("/login", validateInput(validLoginSchema), login);
router.get("/me", authenticate, me);
router.post("/logout", logout);

export default router;
