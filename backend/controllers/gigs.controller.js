import mongoose from "mongoose";
import Gig from "../models/gigs.model.js";
import {
  validateDateRange,
  validateLocation,
} from "../utils/preprocessing_validation.utils.js";
import User from "../models/user.model.js";
import PerformerProfile from "../models/performerProfile.model.js";
import { sendNotification } from "../services/notification.service.js";

export const getGigs = async (req, res) => {
  const rawFilters = req.cleanedQuery || {};
  const { user } = req;

  if (!user) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized access",
    });
  }

  if (user.role === "booker") {
    return res
      .status(400)
      .json({ success: false, error: "Unauthorized access" });
  }

  try {
    const userProfile = await User.findById(user._id).select("location");

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // take pagination out of filters
    const { page: pageRaw, limit: limitRaw, ...filters } = rawFilters;

    // date filter
    if (filters.eventDate) {
      try {
        const { start, end } = validateDateRange(filters.eventDate);
        const dateQuery = {};
        if (start) dateQuery.$gte = start;
        if (end) dateQuery.$lte = end;
        filters.eventDate = dateQuery;
      } catch (err) {
        return res.status(400).json({ success: false, error: err.message });
      }
    }

    // geo
    let geoQuery = {};
    const hasLocation =
      userProfile.location &&
      Array.isArray(userProfile.location.coordinates) &&
      userProfile.location.coordinates.length === 2;

    if (hasLocation) {
      const [lng, lat] = userProfile.location.coordinates;
      const radiusKm = Number(filters.radius) || 25;
      delete filters.radius;

      geoQuery = {
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [lng, lat] },
            $maxDistance: radiusKm * 1000,
          },
        },
      };
    }

    const finalQuery = {
      ...filters,
      ...geoQuery,
      status: "open",
    };

    const page = Number(pageRaw) || 1;
    const limit = Number(limitRaw) || 10;
    const skip = (page - 1) * limit;

    const gigs = await Gig.find(finalQuery)
      .populate("postedBy", "name profileImage")
      .select("-applicants")
      .skip(skip)
      .limit(limit)
      .sort({ "eventDate.start": 1 });

    const total = await Gig.countDocuments(finalQuery);

    return res.status(200).json({
      success: true,
      message: "Fetched gigs successfully",
      count: gigs.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      data: gigs,
    });
  } catch (error) {
    console.error("Error getting gigs:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

export const getGigById = async (req, res) => {
  const { user } = req;
  const { gigId } = req.params;

  if (!user)
    return res
      .status(401)
      .json({ success: false, error: "Unauthorized access" });

  if (!mongoose.Types.ObjectId.isValid(gigId))
    return res.status(400).json({ success: false, error: "Invalid gig id" });

  try {
    const gig = await Gig.findById(gigId)
      .select("-applicants")
      .populate("postedBy", "name profileImage");

    if (!gig)
      return res.status(404).json({ success: false, error: "No gig found" });

    return res.status(200).json({
      success: true,
      message: "Gig fetched successfully",
      data: gig,
    });
  } catch (error) {
    console.error(`Error fetching gig:`, error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

export const createGig = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const { user } = req;
  const { title, description, eventDate, location, budget, categoryRequired } =
    req.cleanedBody;

  if (
    !title ||
    !description ||
    !eventDate ||
    !location ||
    !budget ||
    !categoryRequired
  ) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({
      success: false,
      error: "Required fields cannot be empty",
    });
  }

  try {
    const { lng, lat } = validateLocation(location);
    const loc = {
      type: "Point",
      coordinates: [lng, lat],
      address: location.address,
    };

    const { start, end } = validateDateRange(eventDate);

    const [gig] = await Gig.create(
      [
        {
          postedBy: user._id,
          title,
          description,
          eventDate: { start, end },
          location: loc,
          budget,
          categoryRequired,
          applicants: [],
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Gig created successfully",
      data: gig,
    });
  } catch (error) {
    console.error(`Error creating gig:`, error);
    await session.abortTransaction();
    session.endSession();
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

export const updateGig = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const { user } = req;
  const { gigId } = req.params;
  const updateBody = req.cleanedBody;

  if (!mongoose.Types.ObjectId.isValid(gigId)) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({ success: false, error: "Invalid gig ID" });
  }

  try {
    const gig = await Gig.findById(gigId).session(session);

    if (!gig) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, error: "Gig not found" });
    }

    if (gig.postedBy.toString() !== user._id) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        error: "Only the poster can update this gig",
      });
    }

    if (
      gig.applicants.length > 0 &&
      (updateBody.location || updateBody.eventDate)
    ) {
      return res
        .status(400)
        .json({ success: false, error: "Can not change sensitive data" });
    }

    if (updateBody.location) {
      const { lng, lat } = validateLocation(updateBody.location);
      if (!updateBody.location.address)
        throw new Error("Location address is required");

      gig.location = {
        type: "Point",
        coordinates: [lng, lat],
        address: updateBody.location.address,
      };
    }

    if (updateBody.eventDate) {
      const { start, end } = validateDateRange(updateBody.eventDate);
      gig.eventDate = { start, end };
    }

    gig.title = updateBody.title ?? gig.title;
    gig.description = updateBody.description ?? gig.description;
    gig.categoryRequired = updateBody.categoryRequired ?? gig.categoryRequired;
    gig.budget = updateBody.budget ?? gig.budget;

    await gig.save({ session });

    const updatedGig = await Gig.findById(gigId)
      .select("-applicants")
      .populate("postedBy", "name profileImage");

    await session.commitTransaction();
    session.endSession();

    if (gig.applicants.length > 0) {
      for (const applicant of gig.applicants) {
        await sendNotification(req.io, {
          userId: applicant.performer,
          type: "gig_update",
          title: "Gig Updated",
          message: `The gig '${gig.title}' has been updated.`,
          meta: { gigId },
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Gig updated successfully",
      data: updatedGig,
    });
  } catch (error) {
    console.error(`Error updating gig:`, error);
    await session.abortTransaction();
    session.endSession();
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

export const deleteGig = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const { user } = req;
  const { gigId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(gigId)) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({ success: false, error: "Invalid gig ID" });
  }

  try {
    const gig = await Gig.findById(gigId).session(session);

    if (!gig) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, error: "Gig not found" });
    }

    if (gig.postedBy.toString() !== user._id) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        error: "Only the poster can delete this gig",
      });
    }

    await PerformerProfile.updateMany(
      { appliedGigs: gigId },
      { $pull: { appliedGigs: gigId } },
      { session }
    );

    await Gig.findByIdAndDelete(gigId, { session });

    await session.commitTransaction();
    session.endSession();

    for (const applicant of gig.applicants) {
      await sendNotification(req.io, {
        userId: applicant.performer,
        type: "gig_update",
        title: "Gig Deleted",
        message: `The gig '${gig.title}' has been deleted by the booker.`,
        meta: { gigId },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Gig deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting gig:", error);
    await session.abortTransaction();
    session.endSession();
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

export const applyToGig = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const { user } = req;
  const { gigId } = req.params;
  const { coverMessage } = req.cleanedBody;

  if (user.role !== "performer") {
    await session.abortTransaction();
    session.endSession();
    return res
      .status(403)
      .json({ success: false, error: "Only performers can apply" });
  }

  if (!mongoose.Types.ObjectId.isValid(gigId)) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({ success: false, error: "Invalid gig ID" });
  }

  try {
    const gig = await Gig.findById(gigId).session(session);

    if (!gig) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, error: "Gig not found" });
    }

    if (gig.status !== "open") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, error: "Gig is not open" });
    }

    const alreadyApplied = gig.applicants.some(
      (a) => a.performer.toString() === user._id
    );

    if (alreadyApplied) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        error: "Already applied to this gig",
      });
    }

    gig.applicants.push({
      performer: user._id,
      coverMessage,
      appliedAt: new Date(),
    });

    await gig.save({ session });

    await PerformerProfile.updateOne(
      { user: user._id },
      { $addToSet: { appliedGigs: gigId } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    const performerName =
      req.user.name || (await User.findById(req.user._id).select("name")).name;
    await sendNotification(req.io, {
      userId: gig.postedBy,
      type: "gig_application",
      title: "New Gig Application",
      message: `${performerName} applied to your gig.`,
      meta: { gigId: gig._id },
    });

    return res.status(200).json({
      success: true,
      message: "Applied to gig successfully",
    });
  } catch (error) {
    console.error("Error applying to gig:", error);
    await session.abortTransaction();
    session.endSession();
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

export const withdrawApplication = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const { user } = req;
  const { gigId } = req.params;

  if (user.role !== "performer") {
    await session.abortTransaction();
    session.endSession();
    return res
      .status(403)
      .json({ success: false, error: "Only performers allowed" });
  }

  if (!mongoose.Types.ObjectId.isValid(gigId)) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({ success: false, error: "Invalid gig ID" });
  }

  try {
    const gig = await Gig.findById(gigId).session(session);

    if (!gig) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, error: "Gig not found" });
    }

    const applied = gig.applicants.some(
      (a) => a.performer.toString() === user._id
    );

    if (!applied) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        error: "You have not applied to this gig",
      });
    }

    gig.applicants = gig.applicants.filter(
      (a) => a.performer.toString() !== user._id
    );

    await gig.save({ session });

    await PerformerProfile.updateOne(
      { user: user._id },
      { $pull: { appliedGigs: gigId } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Application withdrawn successfully",
    });
  } catch (error) {
    console.error("Error withdrawing application:", error);
    await session.abortTransaction();
    session.endSession();
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

export const closeGig = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const { user } = req;
  const { gigId } = req.params;
  const { reason } = req.cleanedBody || {};

  if (!mongoose.Types.ObjectId.isValid(gigId)) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({ success: false, error: "Invalid gig ID" });
  }

  try {
    const gig = await Gig.findById(gigId).session(session);

    if (!gig) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, error: "Gig not found" });
    }

    if (gig.postedBy.toString() !== user._id) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        error: "Only the poster can close this gig",
      });
    }

    if (gig.status !== "open") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        error: "Only open gigs can be closed",
      });
    }

    gig.status = "closed";
    if (reason) gig.closeReason = reason;

    await gig.save({ session });

    await PerformerProfile.updateMany(
      { appliedGigs: gigId },
      { $pull: { appliedGigs: gigId } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    for (const applicant of gig.applicants) {
      await sendNotification(req.io, {
        userId: applicant.performer,
        type: "gig_update",
        title: "Gig Closed",
        message: `The gig '${gig.title}' has been closed.`,
        meta: { gigId },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Gig closed successfully",
      data: gig,
    });
  } catch (error) {
    console.error("Error closing gig:", error);
    await session.abortTransaction();
    session.endSession();
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};
