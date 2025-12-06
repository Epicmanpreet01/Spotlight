import Notification from "../models/notification.model.js";
import { NOTIFICATION_TYPES } from "../models/notification.model.js";

export const sendNotification = async (...args) => {
  let payload = {};
  if (args.length === 1 && typeof args[0] === "object") {
    payload = args[0];
  } else {
    const [userId, type, title, message, meta = {}] = args;
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

  return notif;
};
