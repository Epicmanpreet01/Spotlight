// scripts/seed.india.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import User from "../models/user.model.js";
import PerformerProfile from "../models/performerProfile.model.js";
import BookerProfile from "../models/bookerProfile.model.js";
import Gig from "../models/gigs.model.js";
import Booking from "../models/booking.model.js";
import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import Review from "../models/review.model.js";
import Notification from "../models/notification.model.js";

dotenv.config();

/* -------------------- INDIA CITY GEO DATA -------------------- */

const INDIA_CITIES = [
  { city: "Delhi", coords: [77.209, 28.6139] },
  { city: "Mumbai", coords: [72.8777, 19.076] },
  { city: "Bengaluru", coords: [77.5946, 12.9716] },
  { city: "Chennai", coords: [80.2707, 13.0827] },
  { city: "Hyderabad", coords: [78.4867, 17.385] },
  { city: "Pune", coords: [73.8567, 18.5204] },
  { city: "Kolkata", coords: [88.3639, 22.5726] },
  { city: "Jaipur", coords: [75.7873, 26.9124] },
  { city: "Chandigarh", coords: [76.7794, 30.7333] },
  { city: "Ahmedabad", coords: [72.5714, 23.0225] },
];

/* -------------------- CLOUDINARY ASSETS -------------------- */

const performerGallery = [
  "https://res.cloudinary.com/dez9rnwpw/image/upload/v1766143852/performers_gallery/ixizde1mwgqqiuilnox5.jpg",
  "https://res.cloudinary.com/dez9rnwpw/video/upload/v1766143853/performers_gallery/efa24zto4bjbf46i4ja9.mp4",
  "https://res.cloudinary.com/dez9rnwpw/image/upload/v1766143849/performers_gallery/ipzq06s5yp7cukshuz7z.jpg",
  "https://res.cloudinary.com/dez9rnwpw/image/upload/v1766143848/performers_gallery/mpfoff4v3xsfo0l0amml.jpg",
];

const gigImages = [
  "https://res.cloudinary.com/dez9rnwpw/image/upload/v1766165881/gigs_preview/xcwroy9fkdd93shhiwsn.jpg",
  "https://res.cloudinary.com/dez9rnwpw/image/upload/v1766136834/gigs_preview/i7vmgwlodefxkczxmixh.jpg",
  "https://res.cloudinary.com/dez9rnwpw/image/upload/v1766075960/gigs_preview/br13y2hbgbwyrzxhjlqs.jpg",
];

const userImages = [
  "https://res.cloudinary.com/dez9rnwpw/image/upload/v1766125012/user_profile_images/qkfyaeorvs4ahgwmplea.jpg",
  "https://res.cloudinary.com/dez9rnwpw/image/upload/v1765987563/user_profile_images/hs1t77tqk3skaerhz6fw.jpg",
  "https://res.cloudinary.com/dez9rnwpw/image/upload/v1765984537/user_profile_images/p8jc8vrpnff7ysrmtgcp.jpg",
];

/* -------------------- HELPERS -------------------- */

const hash = (pwd) => bcrypt.hashSync(pwd, 10);

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const futureEventRange = () => {
  const start = new Date();
  start.setDate(start.getDate() + Math.floor(Math.random() * 15) + 3);
  const end = new Date(start);
  end.setHours(end.getHours() + 4);
  return { start, end };
};

/* -------------------- SEED LOGIC -------------------- */

async function seedIndia() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("🔥 Connected to DB");

  await Promise.all([
    User.deleteMany(),
    PerformerProfile.deleteMany(),
    BookerProfile.deleteMany(),
    Gig.deleteMany(),
    Booking.deleteMany(),
    Chat.deleteMany(),
    Message.deleteMany(),
    Review.deleteMany(),
    Notification.deleteMany(),
  ]);

  /* ---------- USERS ---------- */

  const performers = [];
  const bookers = [];

  for (let i = 0; i < 15; i++) {
    const city = randomFrom(INDIA_CITIES);

    const performer = await User.create({
      name: `Performer ${i + 1}`,
      email: `performer${i + 1}@test.com`,
      password: hash("password123"),
      role: "performer",
      profileImage: randomFrom(userImages),
      city: city.city,
      location: { type: "Point", coordinates: city.coords },
      isVerified: true,
    });

    await PerformerProfile.create({
      user: performer._id,
      category: randomFrom(["Singer", "DJ", "Dancer", "Comedian", "Magician"]),
      subCategory: ["Live", "Stage"],
      bio: "Experienced performer available for events.",
      priceStartingAt: 8000 + Math.floor(Math.random() * 20000),
      galleryImages: performerGallery,
      videoLinks: performerGallery.filter((u) => u.includes("/video/")),
    });

    performers.push(performer);
  }

  for (let i = 0; i < 10; i++) {
    const city = randomFrom(INDIA_CITIES);

    const booker = await User.create({
      name: `Booker ${i + 1}`,
      email: `booker${i + 1}@test.com`,
      password: hash("password123"),
      role: "booker",
      profileImage: randomFrom(userImages),
      city: city.city,
      location: { type: "Point", coordinates: city.coords },
      isVerified: true,
    });

    await BookerProfile.create({ user: booker._id });
    bookers.push(booker);
  }

  /* ---------- GIGS + BOOKINGS ---------- */

  for (let i = 0; i < 12; i++) {
    const booker = randomFrom(bookers);
    const performer = randomFrom(performers);
    const city = randomFrom(INDIA_CITIES);

    const gig = await Gig.create({
      postedBy: booker._id,
      title: "Live Event Performance",
      description: "Looking for a professional performer.",
      previewImage: randomFrom(gigImages),
      eventDate: futureEventRange(),
      location: {
        type: "Point",
        coordinates: city.coords,
        address: `${city.city}, India`,
      },
      budget: 15000 + Math.floor(Math.random() * 30000),
      categoryRequired: "Singer",
    });

    const booking = await Booking.create({
      booker: booker._id,
      performer: performer._id,
      gig: gig._id,
      eventDate: gig.eventDate,
      durationHours: 4,
      totalPrice: gig.budget,
      status: "confirmed",
      paymentStatus: "escrow_held",
    });

    const chat = await Chat.create({
      booking: booking._id,
      members: [booker._id, performer._id],
      unreadCounts: [
        { user: booker._id, count: 0 },
        { user: performer._id, count: 0 },
      ],
    });

    await Message.create({
      chat: chat._id,
      sender: booker._id,
      text: "Hi, excited for the event!",
      readBy: [booker._id],
    });

    await Review.create({
      booker: booker._id,
      performer: performer._id,
      booking: booking._id,
      rating: Math.floor(Math.random() * 2) + 4,
      comment: "Great performance!",
    });

    await Notification.create({
      user: performer._id,
      type: "booking_update",
      title: "New Booking",
      message: "You have a confirmed booking.",
      meta: { bookingId: booking._id },
    });
  }

  console.log("✅ India-based bulk seed complete");
  process.exit(0);
}

seedIndia().catch((err) => {
  console.error(err);
  process.exit(1);
});
