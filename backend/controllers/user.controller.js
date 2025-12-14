import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";
import { validateLocation } from "../utils/preprocessing_validation.utils.js";
import {
  getPublicIdFromUrl,
  uploadToCloudinary,
} from "../utils/image.utils.js";
import { DEFAULT_COORDS } from "../models/user.model.js";

// update body -> updated profile
export const updateUserProfile = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const { user } = req;
  const updateBody = req.cleanedBody;

  if (!user) {
    await session.abortTransaction();
    session.endSession();
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  try {
    let updateDoc = {};

    // location and city
    if (
      (updateBody.location && !updateBody.city) ||
      (!updateBody.location && updateBody.city)
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        error: "Both location and city must be provided to update location",
      });
    }

    if (updateBody.location && updateBody.city) {
      const { lng, lat } = validateLocation(updateBody.location);

      if (
        updateBody.city === "" &&
        ![lng, lat].every((val, i) => val === DEFAULT_COORDS[i])
      ) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          error: "City cannot be empty string",
        });
      }

      updateDoc.location = {
        type: "Point",
        coordinates: [lng, lat],
      };
      updateDoc.city = updateBody.city;
    }

    // password change
    if (updateBody.newPassword || updateBody.currentPassword) {
      if (!updateBody.newPassword || !updateBody.currentPassword) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          error: "Both current and new password are required",
        });
      }

      const dbUser = await User.findById(user._id)
        .select("+password")
        .session(session);

      if (!dbUser) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(404)
          .json({ success: false, error: "User not found" });
      }

      const samePassword = await bcrypt.compare(
        updateBody.currentPassword,
        dbUser.password
      );

      if (!samePassword) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .json({ success: false, error: "Incorrect current password" });
      }

      const hashed = await bcrypt.hash(updateBody.newPassword, 10);
      updateDoc.password = hashed;
    }

    // copy other valid fields
    for (const key of Object.keys(updateBody)) {
      if (
        !["currentPassword", "newPassword", "location", "city"].includes(key)
      ) {
        updateDoc[key] = updateBody[key];
      }
    }

    // update user
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: updateDoc },
      { new: true, runValidators: true, session }
    ).select("-password -role");

    if (!updatedUser) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    await session.abortTransaction();
    session.endSession();
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

// new image -> updated profile
export const updateProfileImage = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const { user } = req;

  if (!user) {
    await session.abortTransaction();
    session.endSession();
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  if (!req.file) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({
      success: false,
      error: "No image uploaded",
    });
  }

  if (!req.file.mimetype.startsWith("image/")) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({
      success: false,
      error: "Only image uploads allowed",
    });
  }

  try {
    const userProfile = await User.findById(user._id).session(session);

    if (!userProfile) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (userProfile.profileImage) {
      const publicId = getPublicIdFromUrl(userProfile.profileImage);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
      }
    }

    const url = await uploadToCloudinary(req.file, "user_profile_images");
    userProfile.profileImage = url;

    await userProfile.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Profile image updated successfully",
      data: userProfile,
    });
  } catch (error) {
    console.error("Error updating profile image:", error);
    await session.abortTransaction();
    session.endSession();
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

// remove image -> updated profile
export const deleteProfileImage = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const { user } = req;

  if (!user) {
    await session.abortTransaction();
    session.endSession();
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  try {
    const userProfile = await User.findById(user._id).session(session);

    if (!userProfile) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (!userProfile.profileImage) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        error: "No profile image found",
      });
    }

    const publicId = getPublicIdFromUrl(userProfile.profileImage);

    if (!publicId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        error: "Invalid Cloudinary image URL",
      });
    }

    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });

    userProfile.profileImage = undefined;
    await userProfile.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Profile image deleted successfully",
      data: userProfile,
    });
  } catch (error) {
    console.error("Error deleting profile image:", error);
    await session.abortTransaction();
    session.endSession();
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};
