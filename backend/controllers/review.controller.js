import mongoose from "mongoose";
import Review from "../models/review.model.js";
import Booking from "../models/booking.model.js";
import PerformerProfile from "../models/performerProfile.model.js";

export const createReview = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const { user } = req;
  const { bookingId } = req.params;
  const { rating, comment } = req.cleanedBody;

  try {
    const booking = await Booking.findById(bookingId).session(session);

    if (!booking) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ success: false, error: "Booking not found" });
    }

    if (booking.booker.toString() !== user._id) {
      await session.abortTransaction();
      return res.status(403).json({ success: false, error: "Not authorized" });
    }

    if (booking.status !== "completed") {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        error: "You can only review completed bookings",
      });
    }

    const performerId = booking.performer.toString();

    const existing = await Review.findOne({ booking: bookingId }).session(
      session
    );
    if (existing) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        error: "You already reviewed this booking",
      });
    }

    const [review] = await Review.create(
      [
        {
          booker: user._id,
          performer: performerId,
          booking: bookingId,
          rating,
          comment,
        },
      ],
      { session }
    );

    // update stats
    await PerformerProfile.updateRating(performerId);

    await session.commitTransaction();
    await sendNotification(
      performerId,
      "review",
      "New Review Received",
      `${bookerName} left you a review`,
      { performerId, bookingId }
    );

    return res.status(200).json({
      success: true,
      message: "Review submitted",
      data: review,
    });
  } catch (err) {
    console.error("Error submitting review:", err);
    await session.abortTransaction();
    return res.status(500).json({ success: false, error: "Internal error" });
  } finally {
    session.endSession();
  }
};

export const updateReview = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const { user } = req;
  const { reviewId } = req.params;
  const { rating, comment } = req.cleanedBody;

  try {
    const review = await Review.findById(reviewId).session(session);
    if (!review)
      return res
        .status(404)
        .json({ success: false, error: "Review not found" });

    if (review.booker.toString() !== user._id)
      return res.status(403).json({ success: false, error: "Not authorized" });

    review.rating = rating ?? review.rating;
    review.comment = comment ?? review.comment;

    await review.save({ session });

    await PerformerProfile.updateRating(review.performer.toString());

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: "Review updated",
      data: review,
    });
  } catch (err) {
    console.error("Error updating review:", err);
    await session.abortTransaction();
    return res.status(500).json({ success: false, error: "Internal error" });
  } finally {
    session.endSession();
  }
};

export const deleteReview = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const { user } = req;
  const { reviewId } = req.params;

  try {
    const review = await Review.findById(reviewId).session(session);

    if (!review)
      return res
        .status(404)
        .json({ success: false, error: "Review not found" });

    if (review.booker.toString() !== user._id)
      return res.status(403).json({ success: false, error: "Not authorized" });

    const performerId = review.performer;

    await Review.findByIdAndDelete(reviewId, { session });

    await PerformerProfile.updateRating(performerId.toString());

    await session.commitTransaction();
    return res.status(200).json({
      success: true,
      message: "Review deleted",
    });
  } catch (err) {
    console.error("Error deleting review:", err);
    await session.abortTransaction();
    return res.status(500).json({ success: false, error: "Internal error" });
  } finally {
    session.endSession();
  }
};

export const getReviewsForPerformer = async (req, res) => {
  const { performerId } = req.params;

  try {
    const reviews = await Review.find({ performer: performerId })
      .populate("booker", "name profileImage")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Reviews fetched",
      data: reviews,
    });
  } catch (err) {
    console.error("Error fetching reviews:", err);
    return res.status(500).json({ success: false, error: "Internal error" });
  }
};
