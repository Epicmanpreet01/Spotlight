import mongoose, { Schema, model } from "mongoose";

export const NOTIFICATION_TYPES = [
  "gig_application",
  "gig_closed",
  "gig_updated",
  "booking_request",
  "booking_accepted",
  "booking_declined",
  "booking_cancelled",
  "payment_required",
  "payment_success",
  "review_received",
  "system",
];

const NotificationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    metadata: {
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

NotificationSchema.index({ user: 1, read: 1 });

const Notification = model("Notification", NotificationSchema);
export default Notification;
