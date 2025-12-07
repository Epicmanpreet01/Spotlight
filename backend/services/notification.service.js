import Notification from "../models/notification.model.js";
import { NOTIFICATION_TYPES } from "../models/notification.model.js";

export const sendNotification = async (...args) => {
  let io = null;
  let payload = {};

  if (!args.length) {
    throw new Error("sendNotification requires arguments");
  }

  io = args[0];

  if (!io) {
    throw new Error(
      "Socket.io instance (io) is required as the first argument"
    );
  }

  if (typeof args[1] === "object" && !Array.isArray(args[1])) {
    payload = args[1];
  } else {
    const [_, userId, type, title, message, meta = {}] = args;
    payload = { userId, type, title, message, meta };
  }

  if (!payload.userId || !payload.type || !payload.title || !payload.message) {
    throw new Error("Missing required fields for sendNotification");
  }

  const lowered = String(payload.type).toLowerCase();
  const matched = NOTIFICATION_TYPES.find((t) => t.toLowerCase() === lowered);

  if (!matched) {
    throw new Error(`Invalid notification type '${payload.type}'`);
  }

  const notif = await Notification.create({
    user: payload.userId,
    type: matched,
    title: payload.title,
    message: payload.message,
    meta: payload.meta || {},
  });

  io.to(`user:${payload.userId}`).emit("notification", {
    id: notif._id,
    type: matched,
    title: payload.title,
    message: payload.message,
    meta: payload.meta || {},
    createdAt: notif.createdAt,
    read: false,
  });

  return notif;
};
