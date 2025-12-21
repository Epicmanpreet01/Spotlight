import jwt from "jsonwebtoken";
import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import { bumpUnreadCounts } from "../utils/chat.utils.js";

export default function initChatSocket(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Unauthorized"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      socket.user = { _id: decoded._id, role: decoded.role };
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();
    socket.join(`user:${userId}`);
    console.log("connection");
    /* ===================== JOIN CHAT ===================== */
    socket.on("join_chat", async ({ chatId }, ack) => {
      try {
        const chat = await Chat.findById(chatId);
        console.log("joined");
        if (!chat || !chat.isActive) {
          ack?.({ error: "Chat not found or inactive" });
          return;
        }

        if (!chat.members.some((m) => m.toString() === userId)) {
          ack?.({ error: "Unauthorized chat access" });
          return;
        }
        console.log("member");
        socket.join(chatId.toString());

        console.log("✅ JOINED CHAT", chatId, userId);

        ack?.({ success: true });
      } catch (err) {
        console.error("join_chat error:", err);
        ack?.({ error: "Join failed" });
      }
    });

    socket.on("leave_chat", ({ chatId }) => {
      socket.leave(chatId.toString());
    });

    /* ===================== SEND MESSAGE ===================== */
    socket.on("send_message", async ({ chatId, text }, ack) => {
      try {
        if (!text?.trim()) {
          ack?.({ error: "Empty message" });
          return;
        }

        const chat = await Chat.findById(chatId);

        if (!chat || !chat.isActive) {
          ack?.({ error: "Chat inactive" });
          return;
        }

        if (!chat.members.some((m) => m.toString() === userId)) {
          ack?.({ error: "Unauthorized" });
          return;
        }

        const message = await Message.create({
          chat: chatId,
          sender: userId,
          text: text.trim(),
          readBy: [userId],
        });

        chat.lastMessage = message._id;
        bumpUnreadCounts(chat, userId);
        await chat.save();

        const populated = await Message.findById(message._id).populate(
          "sender",
          "name profileImage"
        );

        io.to(chatId.toString()).emit("new_message", {
          chatId,
          message: populated,
        });

        ack?.({ success: true });
      } catch (err) {
        console.error("send_message error:", err);
        ack?.({ error: "Send failed" });
      }
    });
  });
}
