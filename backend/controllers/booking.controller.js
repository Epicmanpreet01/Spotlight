import mongoose from "mongoose";
import Booking from "../models/booking.model.js";
import User from "../models/user.model.js";
import PerformerProfile from "../models/performerProfile.model.js";
import { ensureChatForBooking } from "../utils/chat.utils.js";
import { sendNotification } from "../utils/notification.utils.js"; // implement after

//------------------------------------------------------
// CREATE BOOKING (Booker → Performer)
//------------------------------------------------------
export const createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const { user } = req;
  if (user.role !== "booker")
    return res.status(403).json({ success: false, error: "Not allowed" });

  const { performerId, eventDate, durationHours, totalPrice } = req.cleanedBody;

  try {
    const performer = await User.findById(performerId);
    if (!performer || performer.role !== "performer") {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ success: false, error: "Performer not found" });
    }

    const event = new Date(eventDate);
    if (isNaN(event))
      return res
        .status(400)
        .json({ success: false, error: "Invalid event date" });

    // Check date conflict for performer
    const conflict = await Booking.findOne({
      performer: performerId,
      eventDate: event,
      status: { $in: ["pending", "accepted", "confirmed"] },
    });

    if (conflict) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        error: "Performer is already booked for this timeslot",
      });
    }

    const [booking] = await Booking.create(
      [
        {
          booker: user._id,
          performer: performerId,
          eventDate: event,
          durationHours: durationHours || 1,
          totalPrice,
          status: "pending",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // notify performer
    sendNotification({
      userId: performerId,
      type: "BOOKING_REQUEST",
      title: "New booking request",
      message: "A booker has requested you for an event.",
      data: { bookingId: booking._id },
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

//------------------------------------------------------
// ACCEPT BOOKING (Performer)
//------------------------------------------------------
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

    sendNotification({
      userId: booking.booker,
      type: "BOOKING_ACCEPTED",
      title: "Booking accepted",
      message: "The performer accepted your booking. Please confirm by paying.",
      data: { bookingId: booking._id },
    });

    return res
      .status(200)
      .json({ success: true, message: "Booking accepted", data: booking });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

//------------------------------------------------------
// DECLINE BOOKING (Performer)
//------------------------------------------------------
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

    sendNotification({
      userId: booking.booker,
      type: "BOOKING_DECLINED",
      title: "Booking declined",
      message: "The performer declined your booking.",
      data: { bookingId: booking._id },
    });

    return res.status(200).json({ success: true, message: "Booking declined" });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

//------------------------------------------------------
// CONFIRM BOOKING (Booker → Payment)
//------------------------------------------------------
export const confirmBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const { user } = req;
  const { id } = req.params;

  if (user.role !== "booker")
    return res
      .status(403)
      .json({ success: false, error: "Only booker allowed" });

  try {
    const booking = await Booking.findById(id).session(session);

    if (!booking)
      return res.status(404).json({ success: false, error: "Not found" });

    if (booking.booker.toString() !== user._id)
      return res
        .status(403)
        .json({ success: false, error: "Not your booking" });

    if (booking.status !== "accepted")
      return res
        .status(400)
        .json({ success: false, error: "Not accepted yet" });

    // Payment logic would be here...
    booking.status = "confirmed";
    booking.paymentStatus = "escrow_held";
    await booking.save({ session });

    // create chat once confirmed
    const chat = await ensureChatForBooking(booking, session);

    await session.commitTransaction();
    session.endSession();

    sendNotification({
      userId: booking.performer,
      type: "BOOKING_CONFIRMED",
      title: "Booking confirmed",
      message: "The booker has confirmed & paid for the booking.",
      data: { bookingId: booking._id },
    });

    return res.status(200).json({
      success: true,
      message: "Booking confirmed",
      data: { booking, chat },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

//------------------------------------------------------
// COMPLETE BOOKING (Performer → enters OTP)
//------------------------------------------------------
export const completeBooking = async (req, res) => {
  const { user } = req;
  const { id } = req.params;
  const { code } = req.body;

  try {
    const booking = await Booking.findById(id).select("+completionCode");

    if (!booking)
      return res.status(404).json({ success: false, error: "Not found" });

    if (booking.performer.toString() !== user._id)
      return res
        .status(403)
        .json({ success: false, error: "Not your booking" });

    if (booking.status !== "confirmed")
      return res.status(400).json({ success: false, error: "Not confirmed" });

    const match = await bcrypt.compare(code, booking.completionCode);
    if (!match)
      return res
        .status(400)
        .json({ success: false, error: "Incorrect completion code" });

    booking.status = "completed";
    booking.paymentStatus = "released"; // payout released to performer
    await booking.save();

    sendNotification({
      userId: booking.booker,
      type: "BOOKING_COMPLETED",
      title: "Booking completed",
      message: "The performer has completed the event.",
      data: { bookingId: booking._id },
    });

    return res
      .status(200)
      .json({ success: true, message: "Booking completed" });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

//------------------------------------------------------
// CANCEL BOOKING (Either)
//------------------------------------------------------
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

    if (booking.status === "confirmed")
      return res.status(400).json({
        success: false,
        error: "Cannot cancel confirmed bookings (refund logic needed)",
      });

    booking.status = "cancelled";
    await booking.save();

    const notifyUser = isBooker ? booking.performer : booking.booker;
    sendNotification({
      userId: notifyUser,
      type: "BOOKING_CANCELLED",
      title: "Booking cancelled",
      message: "The booking has been cancelled.",
      data: { bookingId: booking._id },
    });

    return res
      .status(200)
      .json({ success: true, message: "Booking cancelled" });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

//------------------------------------------------------
// GET USER BOOKINGS
//------------------------------------------------------
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
    return res.status(500).json({ success: false, error: "Server error" });
  }
};
