// routes/chat.routes.js
import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  getMyChats,
  getChatById,
  getChatMessages,
  sendMessageRest,
  markChatRead,
} from "../controllers/chat.controller.js";

const router = Router();

router.get("/", authenticate, getMyChats);
router.get("/:chatId", authenticate, getChatById);
router.get("/:chatId/messages", authenticate, getChatMessages);
router.post("/:chatId/messages", authenticate, sendMessageRest);
router.put("/:chatId/read", authenticate, markChatRead);

export default router;
