// controllers/booking.controller.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Booking from "../models/booking.model.js";
import User from "../models/user.model.js";
import PerformerProfile from "../models/performerProfile.model.js";
import BookerProfile from "../models/bookerProfile.model.js";
import { ensureChatForBooking } from "../utils/chat.utils.js";
import { sendNotification } from "../utils/notification.utils.js";
import { validateDateRange } from "../utils/preprocessing_validation.utils.js";

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
}

// create booking (booker → performer)
export const createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const { user } = req;
  const { performerId, eventDate, durationHours, totalPrice } = req.cleanedBody;

  if (user.role !== "booker") {
    await session.abortTransaction();
    session.endSession();
    return res.status(403).json({ success: false, error: "Not allowed" });
  }

  try {
    // Validate performer
    const performer = await User.findById(performerId).session(session);
    if (!performer || performer.role !== "performer") {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, error: "Performer not found" });
    }

    // Validate event date range
    let start, end;
    try {
      const parsed = validateDateRange(eventDate);
      start = parsed.start;
      end = parsed.end;
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, error: err.message });
    }

    // Conflict check: overlap formula
    const conflict = await Booking.findOne({
      performer: performerId,
      status: { $in: ["pending", "accepted", "confirmed"] },
      $or: [
        {
          "eventDate.start": { $lt: end },
          "eventDate.end": { $gt: start },
        },
      ],
    }).session(session);

    if (conflict) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        error: "Performer is already booked for this time range",
      });
    }

    // Create booking
    const [booking] = await Booking.create(
      [
        {
          booker: user._id,
          performer: performerId,
          eventDate: { start, end },
          durationHours: durationHours || 1,
          totalPrice,
          status: "pending",
        },
      ],
      { session }
    );

    // Update performer profile bookings array
    await PerformerProfile.updateOne(
      { user: performerId },
      { $addToSet: { bookings: booking._id } },
      { session }
    );

    // Optional: maintain booker booking list if needed
    await BookerProfile.updateOne(
      { user: user._id },
      { $addToSet: { gigs: booking._id } },
      { session }
    ).catch(() => {}); // ignore if bookers don't track bookings

    await session.commitTransaction();
    session.endSession();

    // Notify performer
    const bookerName =
      user.name || (await User.findById(user._id).select("name")).name;

    await sendNotification(req.io, {
      userId: performerId,
      type: "booking_request",
      title: "New Booking Request",
      message: `${bookerName} sent you a booking request.`,
      meta: { bookingId: booking._id },
    });

    return res.status(200).json({
      success: true,
      message: "Booking request sent",
      data: booking,
    });
  } catch (error) {
    console.error("Create booking error:", error);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// accept booking (performer)
export const acceptBooking = async (req, res) => {
  const { user } = req;
  const { id } = req.params;

  if (user.role !== "performer")
    return res
      .status(403)
      .json({ success: false, error: "Only performer allowed" });

  try {
    const booking = await Booking.findById(id);

    if (!booking)
      return res.status(404).json({ success: false, error: "Not found" });

    if (booking.performer.toString() !== user._id)
      return res
        .status(403)
        .json({ success: false, error: "Not your booking" });

    if (booking.status !== "pending")
      return res.status(400).json({ success: false, error: "Not pending" });

    booking.status = "accepted";
    await booking.save();

    const performerName =
      user.name || (await User.findById(user._id).select("name")).name;

    await sendNotification(req.io, {
      userId: booking.booker,
      type: "booking_update",
      title: "Booking Accepted",
      message: `${performerName} accepted your booking.`,
      meta: { bookingId: booking._id },
    });

    return res.status(200).json({
      success: true,
      message: "Booking accepted",
      data: booking,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// decline booking (performer)
export const declineBooking = async (req, res) => {
  const { user } = req;
  const { id } = req.params;

  if (user.role !== "performer")
    return res.status(403).json({ success: false, error: "Unauthorized" });

  try {
    const booking = await Booking.findById(id);

    if (!booking)
      return res.status(404).json({ success: false, error: "Not found" });

    if (booking.performer.toString() !== user._id)
      return res
        .status(403)
        .json({ success: false, error: "Not your booking" });

    booking.status = "declined";
    await booking.save();

    const performerName =
      user.name || (await User.findById(user._id).select("name")).name;

    await sendNotification(req.io, {
      userId: booking.booker,
      type: "booking_update",
      title: "Booking Declined",
      message: `${performerName} declined your booking.`,
      meta: { bookingId: booking._id },
    });

    return res.status(200).json({
      success: true,
      message: "Booking declined",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// confirm booking (booker)
export const confirmBooking = async (req, res) => {
  const { user } = req;
  const { id } = req.params;

  if (user.role !== "booker") {
    return res
      .status(403)
      .json({ success: false, error: "Only booker allowed" });
  }

  try {
    const booking = await Booking.findById(id);

    if (!booking)
      return res.status(404).json({ success: false, error: "Not found" });

    if (booking.booker.toString() !== user._id.toString())
      return res
        .status(403)
        .json({ success: false, error: "Not your booking" });

    if (booking.status !== "accepted")
      return res
        .status(400)
        .json({ success: false, error: "Not accepted yet" });

    const otp = generateOtp(); // 6-digit string
    const hashedOtp = await bcrypt.hash(otp, 10);

    booking.completionCode = hashedOtp;

    booking.status = "confirmed";
    booking.paymentStatus = "escrow_held";

    await booking.save();

    const chat = await ensureChatForBooking(booking);

    booking.chatId = chat._id;
    await booking.save();

    await sendNotification(req.io, {
      userId: booking.booker,
      type: "booking_update",
      title: "Booking Confirmed",
      message: `Your booking has been confirmed.\nYour event completion OTP is: ${otp}`,
      meta: { bookingId: booking._id },
    });

    await sendNotification(req.io, {
      userId: booking.performer,
      type: "booking_update",
      title: "Booking Confirmed",
      message: `Booker has confirmed this booking.`,
      meta: { bookingId: booking._id },
    });

    return res.status(200).json({
      success: true,
      message: "Booking confirmed successfully",
      data: { booking, chat },
    });
  } catch (error) {
    console.error("confirmBooking error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// complete booking (performer)
export const completeBooking = async (req, res) => {
  const { user } = req;
  const { id } = req.params;
  const { code } = req.body;

  try {
    const booking = await Booking.findById(id)
      .select("+completionCode")
      .populate("performer", "name email");

    if (!booking)
      return res.status(404).json({ success: false, error: "Not found" });

    if (booking.performer._id.toString() !== user._id.toString())
      return res
        .status(403)
        .json({ success: false, error: "Not your booking" });

    if (booking.status !== "confirmed")
      return res.status(400).json({ success: false, error: "Not confirmed" });

    // If OTP system is kept:
    if (booking.completionCode) {
      const isValid = await bcrypt.compare(code, booking.completionCode);
      if (!isValid)
        return res.status(400).json({
          success: false,
          error: "Incorrect completion code",
        });
    }

    // Complete booking (no payout)
    booking.status = "completed";
    booking.paymentStatus = "released"; // simulate release
    await booking.save();

    await sendNotification(req.io, {
      userId: booking.booker,
      type: "booking_update",
      title: "Event Completed",
      message: "Your performer has completed the event.",
      meta: { bookingId: booking._id },
    });

    return res.status(200).json({
      success: true,
      message: "Booking completed successfully (no payout in beta mode)",
      data: booking,
    });
  } catch (error) {
    console.error("Complete booking error:", error);
    return res.status(500).json({
      success: false,
      error: "Could not complete booking",
    });
  }
};

// cancel booking (either party)
export const cancelBooking = async (req, res) => {
  const { user } = req;
  const { id } = req.params;

  try {
    const booking = await Booking.findById(id);

    if (!booking)
      return res.status(404).json({ success: false, error: "Not found" });

    const isBooker = booking.booker.toString() === user._id;
    const isPerformer = booking.performer.toString() === user._id;

    if (!isBooker && !isPerformer)
      return res.status(403).json({ success: false, error: "Unauthorized" });

    // Cancellation rule — disallow if confirmed (refund logic required)
    if (booking.status === "confirmed") {
      return res.status(400).json({
        success: false,
        error: "Cannot cancel confirmed bookings without refund logic",
      });
    }

    booking.status = "cancelled";
    await booking.save();

    const targetUser = isBooker ? booking.performer : booking.booker;

    const name = user.name;

    await sendNotification(req.io, {
      userId: targetUser.name,
      type: "booking_update",
      title: "Booking Cancelled",
      message: `${name} cancelled the booking.`,
      meta: { bookingId: booking._id },
    });

    return res.status(200).json({
      success: true,
      message: "Booking cancelled",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// get all bookings of current user
export const getMyBookings = async (req, res) => {
  const { user } = req;

  try {
    const bookings = await Booking.find({
      $or: [{ booker: user._id }, { performer: user._id }],
    })
      .populate("booker", "name profileImage")
      .populate("performer", "name profileImage")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};
