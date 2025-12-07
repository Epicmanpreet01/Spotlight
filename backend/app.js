import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDb from "./config/db.js";
import { v2 as cloudinary } from "cloudinary";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

import authRouter from "./routes/auth.routes.js";
import performersRouter from "./routes/performers.routes.js";
import gigsRouter from "./routes/gigs.routes.js";
import bookingRouter from "./routes/booking.routes.js";
import userRouter from "./routes/user.routes.js";
import reviewRouter from "./routes/review.routes.js";
import chatRouter from "./routes/chat.routes.js";
import notificationRouter from "./routes/notification.routes.js";

import initChatSocket from "./socket/chat.socket.js";

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
app.use((req, res, next) => {
  req.io = io;
  next();
});

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
app.use("/api/notifications", notificationRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/chat", chatRouter);

const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

initChatSocket(io);

httpServer.listen(PORT, async () => {
  try {
    const host = await connectDb(MONGO_URI);
    console.log(`Server started successfully on: ${PORT}`);
  } catch (error) {
    console.error(`Error occured while running the server: ${error}`);
  }
});
