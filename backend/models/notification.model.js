import mongoose from "mongoose";

export const NOTIFICATION_TYPES = [
  "booking_request",
  "booking_update",
  "payment",
  "gig_application",
  "gig_update",
  "review",
  "chat_message",
];

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
    },

    title: { type: String, required: true },
    message: { type: String, required: true },

    meta: {
      type: Object,
      default: {},
    },

    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", NotificationSchema);
export default Notification;
