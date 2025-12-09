import api from "../api/api.js";

export const getNotifications = async () => {
  const res = await api.get("/notifications");
  return res.data;
};
