import Notification from "../models/notification.model.js";

export const sendNotification = async (
  userId,
  type,
  title,
  message,
  meta = {}
) => {
  const notif = await Notification.create({
    user: userId,
    type,
    title,
    message,
    meta,
  });

  // For real-time (socket.io later):
  // global.io.to(userId.toString()).emit("notification", notif);

  return notif;
};
