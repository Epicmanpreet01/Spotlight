import mongoose from "mongoose";
import Chat from "../models/chat.model.js";
import Booking from "../models/booking.model.js";
import dotenv from "dotenv";

dotenv.config();

async function migrateChats() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to DB");

  const chats = await Chat.find({ booking: { $exists: true } });

  console.log(`🔎 Found ${chats.length} chats to migrate`);

  for (const chat of chats) {
    if (!chat.booking) continue;

    const bookingId = chat.booking;

    // Skip if already migrated
    if (Array.isArray(chat.bookings) && chat.bookings.length > 0) {
      console.log(`⏭️ Chat ${chat._id} already migrated`);
      continue;
    }

    // Verify booking exists
    const booking = await Booking.findById(bookingId).select("status");
    if (!booking) {
      console.warn(`⚠️ Booking ${bookingId} not found, skipping`);
      continue;
    }

    chat.bookings = [bookingId];
    chat.activeBookingCount = booking.status === "confirmed" ? 1 : 0;

    chat.isActive = chat.activeBookingCount > 0;

    // remove legacy field
    chat.booking = undefined;

    await chat.save();
    console.log(`✅ Migrated chat ${chat._id}`);
  }

  console.log("🎉 Migration complete");
  process.exit(0);
}

migrateChats().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
