import api from "../api/api.js";

export const createBooking = async (body) => {
  const res = await api.post("/booking/create", body);
  return res.data;
};

export const acceptBooking = async (id) => {
  const res = await api.put(`/booking/${id}/accept`);
  return res.data;
};

export const confirmBooking = async (id) => {
  const res = await api.put(`/booking/${id}/confirm`);
  return res.data;
};

export const completeBooking = async (id, body) => {
  const res = await api.put(`/booking/${id}/complete`, body);
  return res.data;
};

export const getMyBookings = async () => {
  const res = await api.get("/booking/my-bookings");
  return res.data;
};

export const declineBooking = async (id) => {
  const res = await api.put(`/booking/${id}/decline`);
  return res.data;
};

export const cancelBooking = async (id) => {
  const res = await api.put(`/booking/${id}/cancel`);
  return res.data;
};
