import mongoose, { Schema, model } from "mongoose";

export const PERFORMER_CATEGORIES = [
  "Singer",
  "Music Band",
  "DJ",
  "Instrumentalist",
  "Dancer",
  "Comedian",
  "Magician",
  "Anchor/Emcee",
  "Model",
  "Poet/Storyteller",
  "Motivational Speaker",
  "Mimicry Artist",
  "Traditional/Folk Artist",
  "Rapper/Beatboxer",
  "Circus Act",
];

const PerformerProfileSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    category: {
      type: String,
      required: true,
      enum: {
        values: PERFORMER_CATEGORIES,
        message: "{VALUE} is not a valid category",
      },
      index: true,
    },

    subCategory: {
      type: [String],
      default: [],
    },

    type: {
      type: String,
      enum: ["solo", "group"],
      default: "solo",
    },

    bio: { type: String, maxlength: 500 },

    priceStartingAt: { type: Number, required: true },

    galleryImages: {
      type: [String],
      default: [],
    },

    videoLinks: {
      type: [String],
      default: [],
    },

    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },

    available: {
      type: Boolean,
      default: true,
      required: true,
    },

    appliedGigs: {
      type: [Schema.Types.ObjectId],
      ref: "Gig",
      required: true,
      default: [],
    },

    bookings: {
      type: [Schema.Types.ObjectId],
      ref: "Booking",
      required: true,
      default: [],
    },
    bankDetails: {
      accountNumber: String,
      ifsc: String,
      upiId: String,
    },
  },
  { timestamps: true }
);

PerformerProfileSchema.statics.updateRating = async function (performerId) {
  const Review = mongoose.model("Review");

  const stats = await Review.aggregate([
    { $match: { performer: performerId } },
    {
      $group: {
        _id: "$performer",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const result = stats[0] || { averageRating: 0, reviewCount: 0 };

  await this.findOneAndUpdate(
    { user: performerId },
    {
      averageRating: result.averageRating,
      reviewCount: result.reviewCount,
    }
  );
};

const PerformerProfile = model("PerformerProfile", PerformerProfileSchema);

export default PerformerProfile;
