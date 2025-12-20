// socket/chat.socket.js
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
    const userId = socket.user._id;
    socket.join(`user:${userId}`);

    socket.on("join_chat", async ({ chatId }, ack) => {
      try {
        const chat = await Chat.findById(chatId).populate("booking");

        if (!chat) {
          return ack?.({ error: "Chat not found" });
        }

        if (!chat.members.some((m) => m.toString() === userId.toString())) {
          return ack?.({ error: "Unauthorized chat access" });
        }

        if (!chat.booking || chat.booking.status !== "confirmed") {
          return ack?.({ error: "Chat not active" });
        }

        socket.join(chatId.toString());

        console.log(
          "✅ JOIN SUCCESS",
          "chatId:",
          chatId,
          "user:",
          userId,
          "socket:",
          socket.id
        );
        ack?.({ success: true });
      } catch (err) {
        console.error("join_chat error:", err);
        ack?.({ error: "Join failed" });
      }
    });

    socket.on("leave_chat", ({ chatId }) => {
      socket.leave(chatId.toString());
    });

    socket.on("send_message", async ({ chatId, text }, ack) => {
      try {
        if (!text?.trim()) {
          return ack?.({ error: "Empty message" });
        }

        const chat = await Chat.findById(chatId).populate("booking", "status");

        if (
          !chat ||
          !chat.members.some((m) => m.toString() === userId.toString())
        ) {
          return ack?.({ error: "Unauthorized" });
        }

        if (chat.booking.status !== "confirmed") {
          return ack?.({ error: "Chat not active" });
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
