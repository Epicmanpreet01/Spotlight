import mongoose from "mongoose";
import dotenv from "dotenv";
import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";

dotenv.config();

const normalizeMembers = (members) =>
  members
    .map((m) => m.toString())
    .sort()
    .join("_");

async function mergeDuplicateChats() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to DB");

  const chats = await Chat.find({});
  const map = new Map();

  // Group chats by member pair
  for (const chat of chats) {
    const key = normalizeMembers(chat.members);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(chat);
  }

  let mergedCount = 0;

  for (const [key, group] of map.entries()) {
    if (group.length <= 1) continue;

    console.log(`🔁 Merging ${group.length} chats for ${key}`);

    // Oldest chat = canonical
    group.sort((a, b) => a.createdAt - b.createdAt);
    const primary = group[0];
    const duplicates = group.slice(1);

    const bookingSet = new Set(
      (primary.bookings || []).map((b) => b.toString())
    );

    const unreadMap = new Map();
    primary.unreadCounts?.forEach((u) => {
      unreadMap.set(u.user.toString(), u.count || 0);
    });

    let latestMessage = primary.lastMessage;
    let latestMessageTime = primary.updatedAt;

    for (const dup of duplicates) {
      // ---- merge bookings ----
      dup.bookings?.forEach((b) => bookingSet.add(b.toString()));

      // ---- merge unread counts ----
      dup.unreadCounts?.forEach((u) => {
        const uid = u.user.toString();
        const prev = unreadMap.get(uid) || 0;
        unreadMap.set(uid, Math.max(prev, u.count || 0));
      });

      // ---- move messages ----
      await Message.updateMany(
        { chat: dup._id },
        { $set: { chat: primary._id } }
      );

      // ---- pick latest message ----
      if (dup.updatedAt > latestMessageTime) {
        latestMessage = dup.lastMessage;
        latestMessageTime = dup.updatedAt;
      }

      await Chat.deleteOne({ _id: dup._id });
      mergedCount++;
    }

    primary.bookings = Array.from(bookingSet);
    primary.unreadCounts = Array.from(unreadMap.entries()).map(
      ([user, count]) => ({ user, count })
    );
    primary.lastMessage = latestMessage;
    primary.activeBookingCount = primary.bookings.length;
    primary.isActive = primary.activeBookingCount > 0;

    await primary.save();
  }

  console.log(`🎉 Merge complete. Removed ${mergedCount} duplicate chats`);
  process.exit(0);
}

mergeDuplicateChats().catch((err) => {
  console.error("❌ Merge failed:", err);
  process.exit(1);
});
