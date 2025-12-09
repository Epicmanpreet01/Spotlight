import api from "../api/api.js";

export const getPerformers = async (filters = {}) => {
  const res = await api.get("/performers", { params: filters });
  return res.data;
};

export const getPerformerById = async (id) => {
  const res = await api.get(`/performers/${id}`);
  return res.data;
};

export const updatePerformerProfile = async (form) => {
  const res = await api.put("/performers/profile", form);
  return res.data;
};
