// socket/chat.socket.js
import jwt from "jsonwebtoken";
import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import { bumpUnreadCounts } from "../utils/chat.utils.js";

export default function initChatSocket(io) {
  io.use((socket, next) => {
    // Expect token from client: io("url", { auth: { token } })
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Unauthorized: Missing token"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      socket.user = { _id: decoded._id, role: decoded.role };
      next();
    } catch (err) {
      console.error("Socket auth error:", err);
      next(new Error("Unauthorized: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user._id;
    // Optional: join a personal room for notifications
    socket.join(`user:${userId}`);

    // Client tells us which chat they are viewing
    socket.on("join_chat", async ({ chatId }) => {
      try {
        const chat = await Chat.findById(chatId).populate(
          "booking",
          "status booker performer"
        );

        if (
          !chat ||
          !chat.members.some((m) => m.toString() === userId.toString())
        ) {
          return socket.emit("chat_error", {
            chatId,
            error: "Not authorized for this chat",
          });
        }

        if (chat.booking.status !== "confirmed") {
          return socket.emit("chat_error", {
            chatId,
            error: "Chat only available after booking is confirmed",
          });
        }

        socket.join(chatId.toString());
        socket.emit("joined_chat", { chatId });
      } catch (err) {
        console.error("join_chat error:", err);
        socket.emit("chat_error", {
          chatId,
          error: "Failed to join chat",
        });
      }
    });

    socket.on("leave_chat", ({ chatId }) => {
      socket.leave(chatId.toString());
    });

    // Realtime message send
    socket.on("send_message", async ({ chatId, text }) => {
      if (!text || !text.trim()) {
        return socket.emit("chat_error", {
          chatId,
          error: "Message text required",
        });
      }

      try {
        const chat = await Chat.findById(chatId)
          .populate("booking", "status")
          .exec();

        if (
          !chat ||
          !chat.members.some((m) => m.toString() === userId.toString())
        ) {
          return socket.emit("chat_error", {
            chatId,
            error: "Not authorized for this chat",
          });
        }

        if (chat.booking.status !== "confirmed") {
          return socket.emit("chat_error", {
            chatId,
            error: "Chat only available after booking is confirmed",
          });
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

        // Broadcast to everyone in the chat room
        io.to(chatId.toString()).emit("new_message", {
          chatId,
          message: populated,
        });

        // Also, notify other users individually (for global badge)
        chat.members
          .filter((m) => m.toString() !== userId.toString())
          .forEach((memberId) => {
            io.to(`user:${memberId.toString()}`).emit("chat_notification", {
              type: "NEW_MESSAGE",
              chatId,
              from: userId,
              preview: populated.text,
              createdAt: populated.createdAt,
            });
          });
      } catch (err) {
        console.error("send_message error:", err);
        socket.emit("chat_error", {
          chatId,
          error: "Failed to send message",
        });
      }
    });

    socket.on("disconnect", () => {
      // cleanup if needed
    });
  });
}
