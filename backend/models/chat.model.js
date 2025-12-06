import mongoose, { Schema, model } from "mongoose";

const ChatSchema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    // Last message preview for faster chat list retrieval
    lastMessage: {
      text: { type: String },
      sender: { type: Schema.Types.ObjectId, ref: "User" },
      timestamp: { type: Date },
    },

    // If chat is linked to a booking
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
  },
  { timestamps: true }
);

// Index for fast querying of user chats
ChatSchema.index({ participants: 1 });

const Chat = model("Chat", ChatSchema);
export default Chat;
