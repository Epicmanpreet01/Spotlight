import mongoose, { Schema, model } from "mongoose";

const MessageSchema = new Schema(
  {
    chat: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },

    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: {
      type: String,
      required: true,
    },

    // future support for attachments
    attachment: {
      publicUrl: String,
      type: String, // "image", "video", etc.
    },
  },
  { timestamps: true }
);

MessageSchema.index({ chat: 1, createdAt: -1 });

const Message = model("Message", MessageSchema);
export default Message;
