import mongoose, { Schema, model } from "mongoose";

const ReviewSchema = new Schema(
  {
    booker: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    performer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true, // prevent multiple reviews for same booking
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    comment: {
      type: String,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

// Faster performer reviews lookup
ReviewSchema.index({ performer: 1 });

// Prevent duplicate reviews (safety layer)
ReviewSchema.index({ booker: 1, performer: 1, booking: 1 }, { unique: true });

const Review = model("Review", ReviewSchema);
export default Review;
