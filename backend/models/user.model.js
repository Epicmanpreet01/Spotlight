import mongoose, { Schema, model } from "mongoose";

export const DEFAULT_COORDS = [0, 0];
export const DEFAULT_CITY = "";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["booker", "performer", "admin"],
      default: "booker",
      required: true,
    },

    profileImage: {
      type: String,
      default: "",
    },

    city: { type: String, default: "" },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },

    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

UserSchema.index({ location: "2dsphere" });

const User = mongoose.model("User", UserSchema);

export default User;
