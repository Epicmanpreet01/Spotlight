import mongoose from "mongoose";
import PerformerProfile from "../models/performerProfile.model.js";
import User from "../models/user.model.js";
import { sanitizeVideoLink } from "../utils/preprocessing_validation.utils.js";
import {
  getPublicIdFromUrl,
  uploadToCloudinary,
} from "../utils/image.utils.js";
import { v2 as cloudinary } from "cloudinary";

export const getPerformers = async (req, res) => {
  const { user } = req;
  const rawFilters = req.cleanedQuery || {};
  const { page: pageRaw, limit: limitRaw, ...filters } = rawFilters;
  let mongoQuery = { ...filters };

  if (user && user.role === "performer")
    return res
      .status(401)
      .json({ success: false, error: "Unauthorized access" });

  try {
    let userProfile = null;

    if (user) {
      userProfile = await User.findById(user._id).select("location");
      if (!userProfile) {
        return res
          .status(404)
          .json({ success: false, error: "User not found" });
      }
    }

    // Name search...
    if (mongoQuery.name) {
      const matchingUsers = await User.find({
        name: mongoQuery.name,
      }).select("_id");

      mongoQuery.user = { $in: matchingUsers.map((u) => u._id) };
      delete mongoQuery.name;
    }

    // Geo search...
    if (userProfile?.location?.coordinates?.length === 2) {
      const [lng, lat] = userProfile.location.coordinates;
      const radiusKm = Number(filters.radius) || 25;
      delete mongoQuery.radius;

      const nearbyUsers = await User.find({
        role: "performer",
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [lng, lat] },
            $maxDistance: radiusKm * 1000,
          },
        },
      }).select("_id");

      if (nearbyUsers.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No performers found near your location",
          count: 0,
          pagination: { total: 0, page: 1, pages: 0 },
          data: [],
        });
      }

      const nearIds = nearbyUsers.map((u) => u._id);

      if (mongoQuery.user) {
        mongoQuery.user.$in = mongoQuery.user.$in.filter((id) =>
          nearIds.some((nid) => nid.equals(id))
        );
        if (mongoQuery.user.$in.length === 0) {
          return res.status(200).json({
            success: true,
            message: "No performers matching filters & location",
            count: 0,
            pagination: { total: 0, page: 1, pages: 0 },
            data: [],
          });
        }
      } else {
        mongoQuery.user = { $in: nearIds };
      }
    }

    const privateFields = user ? "city location" : "";
    const publicFields =
      "category subCategory type bio priceStartingAt galleryImages videoLinks averageRating reviewCount";

    const page = Number(pageRaw) || 1;
    const limit = Number(limitRaw) || 10;
    const skip = (page - 1) * limit;

    const performers = await PerformerProfile.find(mongoQuery)
      .populate("user", "name profileImage")
      .select(`${publicFields} ${privateFields}`)
      .skip(skip)
      .limit(limit)
      .sort({ averageRating: -1 });

    const total = await PerformerProfile.countDocuments(mongoQuery);

    return res.status(200).json({
      success: true,
      message: "Fetched performers successfully",
      count: performers.length,
      pagination: { total, page, pages: Math.ceil(total / limit) },
      data: performers,
    });
  } catch (error) {
    console.error("Error fetching performers:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

export const getPerformerById = async (req, res) => {
  const { user } = req;
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid performer id" });
  }

  try {
    const privateFields = user ? "city location" : "";
    const publicFields =
      "category subCategory type bio priceStartingAt galleryImages videoLinks averageRating reviewCount";

    const performer = await PerformerProfile.findById(id)
      .populate("user", "name profileImage")
      .select(`${publicFields} ${privateFields}`);

    if (!performer) {
      return res
        .status(404)
        .json({ success: false, error: "Performer not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Fetched performer successfully",
      data: performer,
    });
  } catch (error) {
    console.error("Error fetching performer:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

export const updatePerformerProfile = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const { user } = req;
  const updateBody = { ...(req.cleanedBody || {}) };

  if (!user) {
    await session.abortTransaction();
    session.endSession();
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  if (Object.keys(updateBody).length === 0) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({
      success: false,
      error: "Update object cannot be empty",
    });
  }

  try {
    // process subCategory
    if (updateBody.subCategory) {
      if (typeof updateBody.subCategory === "string") {
        updateBody.subCategory = updateBody.subCategory
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean);
      }
    }

    // video link sanitization
    if (Array.isArray(updateBody.videoLinks)) {
      updateBody.videoLinks = updateBody.videoLinks
        .map((url) => sanitizeVideoLink(url))
        .filter(Boolean);
    }

    const updated = await PerformerProfile.findOneAndUpdate(
      { user: user._id },
      { $set: updateBody },
      { new: true, runValidators: true, session }
    ).populate("user", "name profileImage email");

    if (!updated) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, error: "Profile not found" });
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating performer profile:", error);
    await session.abortTransaction();
    session.endSession();
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

export const addGalleryImages = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = req.user;

    if (!req.files || req.files.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, error: "No images uploaded" });
    }

    if (req.files.length > 10) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, error: "Too many files" });
    }

    const profile = await PerformerProfile.findOne({ user: user._id }).session(
      session
    );

    if (!profile) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, error: "Profile not found" });
    }

    if (profile.galleryImages.length + req.files.length > 20) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        error: "Max 20 gallery images allowed",
      });
    }

    // Upload → Cloudinary
    const uploadedUrls = [];
    for (const file of req.files) {
      const url = await uploadToCloudinary(file);
      uploadedUrls.push(url);
    }

    // update gallery
    profile.galleryImages = Array.from(
      new Set([...uploadedUrls, ...profile.galleryImages])
    );

    await profile.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Images uploaded successfully",
      galleryImages: profile.galleryImages,
    });
  } catch (error) {
    console.error("Error adding gallery images:", error);
    await session.abortTransaction();
    session.endSession();
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

export const removeGalleryImage = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = req.user;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, error: "imageUrl is required" });
    }

    if (!imageUrl.includes("res.cloudinary.com")) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, error: "Invalid Cloudinary URL" });
    }

    const profile = await PerformerProfile.findOne({ user: user._id }).session(
      session
    );

    if (!profile) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, error: "Profile not found" });
    }

    if (!profile.galleryImages.includes(imageUrl)) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, error: "Image not found in gallery" });
    }

    // Delete from Cloudinary
    const publicId = getPublicIdFromUrl(imageUrl);
    const resourceType = imageUrl.includes(".mp4") ? "video" : "image";

    if (publicId) {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });
    }

    // Remove from DB
    profile.galleryImages = profile.galleryImages.filter(
      (img) => img !== imageUrl
    );

    await profile.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Image removed successfully",
      galleryImages: profile.galleryImages,
    });
  } catch (error) {
    console.error("Error removing gallery image:", error);
    await session.abortTransaction();
    session.endSession();
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};
