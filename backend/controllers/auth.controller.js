import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import PerformerProfile from "../models/performerProfile.model.js";
import BookerProfile from "../models/bookerProfile.model.js";

const hashpassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const generateToken = async (user) => {
  const payload = {
    _id: user._id,
    role: user.role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: "30d",
  });
};

export const signup = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const { name, email, password, role, category, priceStartingAt, type } =
    req.cleanedBody;

  if (!name || !email || !password || !role) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({
      success: false,
      error: "Name, email, password, role are required",
    });
  }

  if (role === "performer") {
    if (!(category && priceStartingAt)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        error: "Performers need to provide category and price",
      });
    }
    if (type && !["solo", "group"].includes(type)) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, error: "Invalid type for performer" });
    }
  }

  try {
    // Check if email exists
    const emailExists = await User.findOne({ email }).session(session);
    if (emailExists) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        error: "Email already exists",
      });
    }

    const hashedPassword = await hashpassword(password);

    // Create user inside the transaction
    const [user] = await User.create(
      [
        {
          name,
          email,
          password: hashedPassword,
          role,
        },
      ],
      { session }
    );

    const token = await generateToken(user);

    if (role === "performer") {
      await PerformerProfile.create(
        [
          {
            user: user._id,
            category,
            type,
            priceStartingAt,
          },
        ],
        { session }
      );
    }

    if (role === "booker") {
      await BookerProfile.create([{ user: user._id }], {
        session,
      });
    }

    user.password = undefined;

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "User created successfully",
      data: user,
      token,
    });
  } catch (error) {
    console.error(`Error while signing user in: ${error}`);

    await session.abortTransaction();
    session.endSession();

    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.cleanedBody;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: "Email and password are required",
    });
  }

  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const samePassword = await bcrypt.compare(password, user.password);
    if (!samePassword) {
      return res.status(400).json({
        success: false,
        error: "Incorrect password",
      });
    }

    const token = await generateToken(user);
    user.password = undefined;

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: user,
      token,
    });
  } catch (error) {
    console.error(`Error occurred while logging user in: ${error}`);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const logout = async (_req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

export const me = async (req, res) => {
  const { user } = req;

  try {
    /* ===================== BASE USER ===================== */
    const me = await User.findById(user._id).select("-password");

    if (!me) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    let profile = null;

    /* ===================== PERFORMER ===================== */
    if (me.role === "performer") {
      profile = await PerformerProfile.findOne({ user: me._id })
        .populate({
          path: "appliedGigs",
          select: "title eventDate location budget status categoryRequired",
        })
        .populate({
          path: "bookings",
          match: { status: "completed" },
          populate: {
            path: "gig",
            select: "title location eventDate",
          },
        });
    }

    /* ===================== BOOKER ===================== */
    if (me.role === "booker") {
      profile = await BookerProfile.findOne({ user: me._id })
        .populate({
          path: "gigs",
          select: "title eventDate location budget status categoryRequired",
        })
        .populate({
          path: "bookings",
          populate: [
            {
              path: "gig",
              select: "title location eventDate",
            },
            {
              path: "performer",
              select: "name profileImage",
            },
          ],
        });
    }

    return res.status(200).json({
      success: true,
      message: "Fetched user details successfully",
      data: me,
      profile,
    });
  } catch (error) {
    console.error("Error fetching /me:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
