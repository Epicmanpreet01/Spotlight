import mongoose, { Schema, model } from "mongoose";

const BookingSchema = new Schema(
  {
    booker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    performer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // If this booking came from a Public Gig, link it here
    gig: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gig",
      default: null,
    },

    eventDate: {
      start: {
        type: Date,
        required: true,
      },
      end: {
        type: Date,
        required: true,
      },
    },
    durationHours: { type: Number, default: 1 },

    totalPrice: { type: Number, required: true },

    // The lifecycle of the booking
    status: {
      type: String,
      enum: [
        "pending", // Performer needs to accept
        "accepted", // Performer accepted, waiting for payment
        "confirmed", // Booker paid (escrow)
        "completed", // Event done
        "cancelled", // Cancelled by either party
        "declined", // Performer said no
      ],
      default: "pending",
    },
    completionCode: { type: String, select: false }, // The 4-6 digit OTP (Hashed in DB)
    platformFee: Number, // Your cut (e.g., 10%)
    performerPayout: Number, // The remaining 90%
    cancellationDeadline: Date, // e.g., Event Date - 24 hours
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "escrow_held", "released", "refunded"],
      default: "unpaid",
    },
  },
  { timestamps: true }
);

const Booking = model("Booking", BookingSchema);

export default Booking;
