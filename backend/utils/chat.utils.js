import Chat from "../models/chat.model.js";

export async function ensureChatForBooking(booking, session) {
  const members = [booking.booker, booking.performer];

  let chat = await Chat.findOne({
    members: { $all: members },
  }).session(session);

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

export function bumpUnreadCounts(chatDoc, senderId) {
  const senderStr = senderId.toString();

  chatDoc.unreadCounts = chatDoc.unreadCounts.map((entry) => {
    if (entry.user.toString() === senderStr) {
      return entry;
    }
    return { ...entry.toObject(), count: (entry.count || 0) + 1 };
  });
}

export function resetUnreadForUser(chatDoc, userId) {
  const userStr = userId.toString();

  chatDoc.unreadCounts = chatDoc.unreadCounts.map((entry) => {
    if (entry.user.toString() === userStr) {
      return { ...entry.toObject(), count: 0 };
    }
    return entry;
  });
}
