import mongoose, { Schema, model } from "mongoose";

const BookerProfileSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    gigs: {
      type: [mongoose.Types.ObjectId],
      ref: "Gig",
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const BookerProfile = model("BookerProfile", BookerProfileSchema);

export default BookerProfile;
