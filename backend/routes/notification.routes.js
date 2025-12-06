import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";

import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controllers/notification.controller.js";

const router = Router();

router.get("/", authenticate, getMyNotifications);
router.put("/:id/read", authenticate, markAsRead);
router.put("/read/all", authenticate, markAllAsRead);
router.delete("/:id", authenticate, deleteNotification);

export default router;
