import api from "../api/api";

export const signupUser = async (payload) => {
  const res = await api.post("/auth/signup", payload);
  return res.data;
};

export const loginUser = async (payload) => {
  const res = await api.post("/auth/login", payload);
  return res.data;
};

export const getMe = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};
