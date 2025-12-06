import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDb from "./config/db.js";
import { v2 as cloudinary } from "cloudinary";

import authRouter from "./routes/auth.routes.js";
import performersRouter from "./routes/performers.routes.js";
import gigsRouter from "./routes/gigs.routes.js";
import bookingRouter from "./routes/booking.routes.js";
import userRouter from "./routes/user.routes.js";

dotenv.config();
const app = express();

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(express.json());
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  return res
    .status(200)
    .json({ success: true, message: "API reached successfully" });
});

app.use("/api/auth", authRouter);
app.use("/api/performers", performersRouter);
app.use("/api/gigs", gigsRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/user", userRouter);

app.listen(PORT, async () => {
  try {
    const host = await connectDb(MONGO_URI);
    console.log(`Server started successfully on: ${PORT}`);
  } catch (error) {
    console.error(`Error occured while running the server: ${error}`);
  }
});
