// utils/chat.utils.js
import Chat from "../models/chat.model.js";

/**
 * Ensure a chat exists for a confirmed booking.
 * Creates if missing and returns the Chat doc.
 */
export async function ensureChatForBooking(booking, session) {
  let chat = await Chat.findOne({ booking: booking._id }).session(session);
  if (chat) return chat;

  chat = await Chat.create(
    [
      {
        booking: booking._id,
        members: [booking.booker, booking.performer],
        unreadCounts: [
          { user: booking.booker, count: 0 },
          { user: booking.performer, count: 0 },
        ],
      },
    ],
    { session }
  );

  return chat[0];
}

/**
 * Increment unread counts for all members except sender.
 */
export function bumpUnreadCounts(chatDoc, senderId) {
  const senderStr = senderId.toString();
  chatDoc.unreadCounts = chatDoc.unreadCounts.map((entry) => {
    if (entry.user.toString() === senderStr) {
      return entry; // don't increment for sender
    }
    return { ...entry.toObject(), count: (entry.count || 0) + 1 };
  });
}

/**
 * Reset unread count to 0 for a user.
 */
export function resetUnreadForUser(chatDoc, userId) {
  const userStr = userId.toString();
  chatDoc.unreadCounts = chatDoc.unreadCounts.map((entry) => {
    if (entry.user.toString() === userStr) {
      return { ...entry.toObject(), count: 0 };
    }
    return entry;
  });
}
