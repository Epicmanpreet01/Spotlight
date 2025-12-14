// controllers/chat.controller.js
import mongoose from "mongoose";
import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import { resetUnreadForUser, bumpUnreadCounts } from "../utils/chat.utils.js";

/**
 * GET /api/chat
 * List all chats for current user (only confirmed bookings)
 */
export const getMyChats = async (req, res) => {
  const { user } = req;

  try {
    const chats = await Chat.find({
      members: user._id,
    })
      .populate({
        path: "booking",
        select: "status eventDate performer booker",
      })
      .populate({
        path: "lastMessage",
        select: "text sender createdAt",
        populate: { path: "sender", select: "name profileImage" },
      })
      .sort({ updatedAt: -1 });

    // Only keep confirmed bookings
    const filtered = chats.filter((c) => c.booking?.status === "confirmed");

    return res.status(200).json({
      success: true,
      message: "Fetched chats successfully",
      count: filtered.length,
      data: filtered,
    });
  } catch (err) {
    console.error("Error fetching chats:", err);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

/**
 * GET /api/chat/:chatId
 * Get single chat details
 */
export const getChatById = async (req, res) => {
  const { user } = req;
  const { chatId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return res.status(400).json({ success: false, error: "Invalid chat id" });
  }

  try {
    const chat = await Chat.findById(chatId)
      .populate("members", "name profileImage")
      .populate("booking", "status eventDate performer booker");

    if (!chat) {
      return res.status(404).json({ success: false, error: "Chat not found" });
    }

    if (!chat.members.some((m) => m._id.toString() === user._id.toString())) {
      return res.status(403).json({
        success: false,
        error: "You are not a member of this chat",
      });
    }

    if (chat.booking?.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        error: "Chat only available after booking is confirmed",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Fetched chat successfully",
      data: chat,
    });
  } catch (err) {
    console.error("Error fetching chat:", err);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

/**
 * GET /api/chat/:chatId/messages?page=&limit=
 * Paginated messages for a chat
 */
export const getChatMessages = async (req, res) => {
  const { user } = req;
  const { chatId } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 30;
  const skip = (page - 1) * limit;

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return res.status(400).json({ success: false, error: "Invalid chat id" });
  }

  try {
    const chat = await Chat.findById(chatId).populate(
      "booking",
      "status booker performer"
    );

    if (!chat) {
      return res.status(404).json({ success: false, error: "Chat not found" });
    }

    if (!chat.members.some((m) => m.toString() === user._id)) {
      return res.status(403).json({
        success: false,
        error: "You are not a member of this chat",
      });
    }

    if (chat.booking.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        error: "Chat only available after booking is confirmed",
      });
    }

    const [messages, total] = await Promise.all([
      Message.find({ chat: chatId })
        .populate("sender", "name profileImage")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Message.countDocuments({ chat: chatId }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Fetched messages successfully",
      count: messages.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      data: messages.reverse(), // oldest → newest
    });
  } catch (err) {
    console.error("Error fetching messages:", err);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

/**
 * POST /api/chat/:chatId/messages
 * Create a message (REST fallback, Socket does the same internally)
 */
export const sendMessageRest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const { user } = req;
  const { chatId } = req.params;
  const { text } = req.body;

  if (!text || text.trim() === "") {
    await session.abortTransaction();
    session.endSession();
    return res
      .status(400)
      .json({ success: false, error: "Message text is required" });
  }

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({ success: false, error: "Invalid chat id" });
  }

  try {
    const chat = await Chat.findById(chatId)
      .populate("booking", "status")
      .session(session);

    if (!chat) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, error: "Chat not found" });
    }

    if (!chat.members.some((m) => m.toString() === user._id)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        error: "You are not a member of this chat",
      });
    }

    if (chat.booking.status !== "confirmed") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        error: "Chat only available after booking is confirmed",
      });
    }

    const [message] = await Message.create(
      [
        {
          chat: chatId,
          sender: user._id,
          text: text.trim(),
          readBy: [user._id],
        },
      ],
      { session }
    );

    chat.lastMessage = message._id;
    bumpUnreadCounts(chat, user._id);

    await chat.save({ session });

    await session.commitTransaction();
    session.endSession();

    const populated = await Message.findById(message._id).populate(
      "sender",
      "name profileImage"
    );

    return res.status(200).json({
      success: true,
      message: "Message sent",
      data: populated,
    });
  } catch (err) {
    console.error("Error sending message:", err);
    await session.abortTransaction();
    session.endSession();
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

/**
 * PUT /api/chat/:chatId/read
 * Mark messages as read in a chat for current user
 */
export const markChatRead = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const { user } = req;
  const { chatId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({ success: false, error: "Invalid chat id" });
  }

  try {
    const chat = await Chat.findById(chatId).session(session);

    if (!chat) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, error: "Chat not found" });
    }

    if (!chat.members.some((m) => m.toString() === user._id)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        error: "You are not a member of this chat",
      });
    }

    resetUnreadForUser(chat, user._id);
    await chat.save({ session });

    // Mark messages read
    await Message.updateMany(
      { chat: chatId, readBy: { $ne: user._id } },
      { $addToSet: { readBy: user._id } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Chat marked as read",
    });
  } catch (err) {
    console.error("Error marking chat as read:", err);
    await session.abortTransaction();
    session.endSession();
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};
