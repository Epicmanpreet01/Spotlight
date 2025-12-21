import Chat from "../models/chat.model.js";

/**
 * Ensure a chat exists between booker & performer.
 * Adds booking to chat.bookings[] if missing.
 */
export async function ensureChatForBooking(booking, session) {
  const members = [booking.booker, booking.performer];

  // 1️⃣ Find existing chat between same users
  let chat = await Chat.findOne({
    members: { $all: members },
  }).session(session);

  // 2️⃣ If chat exists, attach booking if not present
  if (chat) {
    const alreadyLinked = chat.bookings?.some(
      (b) => b.toString() === booking._id.toString()
    );

    if (!alreadyLinked) {
      chat.bookings.push(booking._id);
      chat.isActive = true;
      await chat.save({ session });
    }

    return chat;
  }

  // 3️⃣ Create new chat
  const [created] = await Chat.create(
    [
      {
        members,
        bookings: [booking._id],
        unreadCounts: [
          { user: booking.booker, count: 0 },
          { user: booking.performer, count: 0 },
        ],
        isActive: true,
      },
    ],
    { session }
  );

  return created;
}

/**
 * Increment unread counts for all members except sender.
 */
export function bumpUnreadCounts(chatDoc, senderId) {
  const senderStr = senderId.toString();

  chatDoc.unreadCounts = chatDoc.unreadCounts.map((entry) => {
    if (entry.user.toString() === senderStr) {
      return entry;
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
