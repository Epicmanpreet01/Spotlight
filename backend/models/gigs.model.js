import mongoose, { Schema, model } from "mongoose";

const GigSchema = new Schema(
  {
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: { type: String, required: true },
    description: { type: String, required: true },

    previewImage: {
      type: String,
      required: true,
    },

    eventDate: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },

    location: {
      type: { type: String, default: "Point" },
      coordinates: [Number],
      address: { type: String, required: true },
    },

    budget: { type: Number, required: true },
    categoryRequired: { type: String, required: true },

    status: {
      type: String,
      enum: ["open", "closed", "cancelled"],
      default: "open",
    },

    applicants: [
      {
        performer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        coverMessage: String,
        appliedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

GigSchema.index({ location: "2dsphere" });

const Gig = model("Gig", GigSchema);

export default Gig;
