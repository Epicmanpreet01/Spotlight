// controllers/booking.controller.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Booking from "../models/booking.model.js";
import User from "../models/user.model.js";
import PerformerProfile from "../models/performerProfile.model.js";
import BookerProfile from "../models/bookerProfile.model.js";
import { ensureChatForBooking } from "../utils/chat.utils.js";
import { sendNotification } from "../services/notification.service.js";
import { validateDateRange } from "../utils/preprocessing_validation.utils.js";
import Gig from "../models/gigs.model.js";
import { encryptOtp, decryptOtp } from "../utils/otpcrypto.utils.js";
import Chat from "../models/chat.model.js";

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
}

function getBookerIdString(booking) {
  if (!booking.booker) return null;

  // populated
  if (typeof booking.booker === "object" && booking.booker._id) {
    return booking.booker._id.toString();
  }

  // ObjectId
  return booking.booker.toString();
}

// get booking by id (booker or performer)
export const getBookingById = async (req, res) => {
  const { user } = req;
  const { id } = req.params;

  try {
    const booking = await Booking.findById(id)
      .populate({
        path: "booker",
        select: "name profileImage",
      })
      .populate({
        path: "performer",
        select: "name profileImage",
      })
      .populate({
        path: "gig",
        select:
          "title description previewImage budget location eventDate status",
      })
      .select("+completionCode")
      .lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    const isBooker = booking.booker._id.toString() === user._id.toString();
    const isPerformer =
      booking.performer._id.toString() === user._id.toString();

    if (!isBooker && !isPerformer) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to view this booking",
      });
    }

    let decryptedOtp = null;

    if (isBooker && booking.status === "confirmed" && booking.completionCode) {
      try {
        const bookerId = booking.booker?._id
          ? booking.booker._id.toString()
          : booking.booker.toString();

        decryptedOtp = decryptOtp(booking.completionCode, bookerId);
      } catch (err) {
        console.error("OTP decrypt failed:", err);
      }
    }

    if (!isBooker) {
      booking.completionCode = null;
      delete booking.paymentStatus;
    }

    return res.status(200).json({
      success: true,
      data: {
        ...booking,
        completionCode: decryptedOtp,
      },
    });
  } catch (error) {
    console.error("getBookingById error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// create booking (booker → performer) required fields -> created booking
export const createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const { user } = req;

  const {
    performerId,
    gigId,
    eventDate,
    totalPrice,
    source = "direct", // "direct" | "applicant"
  } = req.cleanedBody;
  console.log(source);
  if (user.role !== "booker") {
    await session.abortTransaction();
    session.endSession();
    return res.status(403).json({ success: false, error: "Not allowed" });
  }

  try {
    const performer = await User.findById(performerId).session(session);
    if (!performer || performer.role !== "performer") {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, error: "Performer not found" });
    }

    const gig = await Gig.findById(gigId).session(session);
    if (!gig) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, error: "Gig not found" });
    }

    if (gig.postedBy.toString() !== user._id.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        error: "You are not allowed to book for this gig",
      });
    }

    const isApplicant = gig.applicants?.some(
      (a) => a.performer.toString() === performerId.toString()
    );

    if (!isApplicant && source === "applicant") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        error: "Performer is not an applicant for this gig",
      });
    }

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

    let durationMs = end - start;
    let durationHours = durationMs / (1000 * 60 * 60);
    durationHours = Math.max(1, Math.round(durationHours * 2) / 2);

    const conflict = await Booking.findOne({
      performer: performerId,
      status: { $nin: ["cancelled", "declined", "completed"] },
      "eventDate.start": { $lt: end },
      "eventDate.end": { $gt: start },
    }).session(session);

    if (conflict) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        error: "Performer is already booked for this time range",
      });
    }

    const bookingStatus = source === "applicant" ? "accepted" : "pending";

    const [booking] = await Booking.create(
      [
        {
          booker: user._id,
          performer: performerId,
          gig: gigId,
          eventDate: { start, end },
          durationHours,
          totalPrice,
          status: bookingStatus,
        },
      ],
      { session }
    );

    gig.status = "closed";
    await gig.save({ session });

    await PerformerProfile.updateMany(
      { appliedGigs: gig._id },
      { $pull: { appliedGigs: gig._id } },
      { session }
    );

    await PerformerProfile.updateOne(
      { user: performerId },
      { $addToSet: { bookings: booking._id } },
      { session }
    );

    await BookerProfile.updateOne(
      { user: user._id },
      { $addToSet: { bookings: booking._id } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    const bookerName =
      user.name || (await User.findById(user._id).select("name")).name;

    await sendNotification(req.io, {
      userId: performerId,
      type: bookingStatus === "accepted" ? "booking_update" : "booking_request",
      title:
        bookingStatus === "accepted"
          ? "Booking Confirmed"
          : "New Booking Request",
      message:
        bookingStatus === "accepted"
          ? `${bookerName} confirmed your booking.`
          : `${bookerName} sent you a booking request.`,
      meta: { bookingId: booking._id, gigId },
    });

    return res.status(200).json({
      success: true,
      message:
        bookingStatus === "accepted"
          ? "Booking confirmed"
          : "Booking request sent",
      data: booking,
    });
  } catch (error) {
    console.error("Create booking error:", error);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// accept booking (performer) id -> updated booking
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

// decline booking (performer) id -> updated booking
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

    if (booking.status !== "pending") {
      return res.status(400).json({
        success: false,
        error: "Only pending bookings can be declined",
      });
    }

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

// confirm booking (booker) id -> confirmed booking and chat and otp (ONLY FOR DEVELOPMENT)
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

    const otp = generateOtp();

    const bookerId = getBookerIdString(booking);
    const encryptedOtp = encryptOtp(otp, bookerId);

    booking.completionCode = encryptedOtp;
    booking.status = "confirmed";
    booking.paymentStatus = "escrow_held";

    await booking.save();

    let chat = await Chat.findOne({
      members: { $all: [booking.booker, booking.performer] },
    });

    if (!chat) {
      chat = await Chat.create({
        members: [booking.booker, booking.performer],
        bookings: [booking._id],
        unreadCounts: [
          { user: booking.booker, count: 0 },
          { user: booking.performer, count: 0 },
        ],
        isActive: true,
      });
    } else {
      await Chat.updateOne(
        { _id: chat._id },
        {
          $addToSet: { bookings: booking._id },
          $set: { isActive: true },
        }
      );
    }

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
      confirmationCode: otp,
      data: { booking, chat },
    });
  } catch (error) {
    console.error("confirmBooking error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// complete booking (performer) id -> completed booking
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

    if (!code) {
      return res.status(400).json({
        success: false,
        error: "Completion code is required",
      });
    }
    const current = new Date();
    if (current < booking.eventDate.start) {
      return res.status(401).json({
        success: false,
        error: "Can not complete event before event start",
      });
    }

    if (!booking.completionCode) {
      return res.status(400).json({
        success: false,
        error: "No completion code set for this booking",
      });
    }
    if (!booking.completionCode || booking.completionCode.length < 40) {
      throw new Error("Invalid encrypted OTP format");
    }
    const bookerId = getBookerIdString(booking);
    const realOtp = decryptOtp(booking.completionCode, bookerId);

    if (String(code) !== realOtp) {
      return res.status(400).json({
        success: false,
        error: "Incorrect completion code",
      });
    }

    booking.status = "completed";
    booking.paymentStatus = "released";
    await booking.save();

    const chat = await Chat.findOne({ bookings: booking._id });

    if (chat) {
      await Chat.updateOne(
        { _id: chat._id },
        { $pull: { bookings: booking._id } }
      );

      const remaining = await Booking.countDocuments({
        $or: [
          { booker: booking.booker, performer: booking.performer },
          { booker: booking.performer, performer: booking.booker },
        ],
        status: "confirmed",
      });

      if (remaining === 0) {
        await Chat.updateOne({ _id: chat._id }, { $set: { isActive: false } });
      }
    }

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

// cancel booking (either party) id -> updated booking
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

    if (booking.status === "confirmed") {
      return res.status(400).json({
        success: false,
        error: "Cannot cancel confirmed bookings without refund logic",
      });
    }

    booking.status = "cancelled";
    await booking.save();

    const targetUserId = isBooker ? booking.performer : booking.booker;

    const name = user.name;

    await sendNotification(req.io, {
      userId: targetUserId,
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

// get all bookings of current user id -> get all bookings of current user
export const getMyBookings = async (req, res) => {
  const { user } = req;

  try {
    const bookings = await Booking.find({
      $or: [{ booker: user._id }, { performer: user._id }],
    })
      .populate({
        path: "booker",
        select: "name profileImage",
      })
      .populate({
        path: "performer",
        select: "name profileImage",
      })
      .populate({
        path: "gig",
        select: "title previewImage budget location eventDate status",
      })
      .sort({ createdAt: -1 })
      .lean();

    const sanitizedBookings = bookings.map((booking) => {
      if (booking.booker._id.toString() !== user._id.toString()) {
        delete booking.completionCode;
      }
      return booking;
    });

    return res.status(200).json({
      success: true,
      data: sanitizedBookings,
    });
  } catch (error) {
    console.error("getMyBookings error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};
