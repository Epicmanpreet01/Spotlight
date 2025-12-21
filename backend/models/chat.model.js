// models/chat.model.js
import mongoose, { Schema, model } from "mongoose";

const ChatSchema = new Schema(
  {
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    /**
     * Multiple confirmed bookings between same users
     * One chat per (booker ↔ performer) relationship
     */
    bookings: [
      {
        type: Schema.Types.ObjectId,
        ref: "Booking",
        required: true,
      },
    ],

    activeBookingsCount: {
      type: Number,
      default: 0,
      index: true,
    },

    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },

    unreadCounts: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        count: { type: Number, default: 0 },
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

/**
 * Ensure only one chat per member pair
 */
ChatSchema.index({ members: 1 }, { unique: true });

const Chat = model("Chat", ChatSchema);
export default Chat;
