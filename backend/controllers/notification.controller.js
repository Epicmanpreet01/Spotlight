import Notification from "../models/notification.model.js";

export const getMyNotifications = async (req, res) => {
  const { user } = req;

  try {
    const notifications = await Notification.find({ user: user._id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      message: "Fetched notifications",
      data: notifications,
    });
  } catch (err) {
    console.error("Fetch notifications error:", err);
    return res.status(500).json({ success: false, error: "Internal error" });
  }
};

export const markAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notif)
      return res
        .status(404)
        .json({ success: false, error: "Notification not found" });

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notif,
    });
  } catch (err) {
    console.error("Mark read error:", err);
    return res.status(500).json({ success: false, error: "Internal error" });
  }
};

export const markAllAsRead = async (req, res) => {
  const { user } = req;

  try {
    await Notification.updateMany(
      { user: user._id, read: false },
      { read: true }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (err) {
    console.error("Mark all read error:", err);
    return res.status(500).json({ success: false, error: "Internal error" });
  }
};

export const deleteNotification = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Notification.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted",
    });
  } catch (err) {
    console.error("Delete notification error:", err);
    return res.status(500).json({ success: false, error: "Internal error" });
  }
};

export const deleteAllNotifications = async (req, res) => {
  const { user } = req;

  try {
    await Notification.deleteMany({ user: user._id });

    return res.status(200).json({
      success: true,
      message: "All notifications deleted",
    });
  } catch (err) {
    console.error("Delete all notifications error:", err);
    return res.status(500).json({ success: false, error: "Internal error" });
  }
};
