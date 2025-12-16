import api from "./api";

export const getCurrentUser = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};

export const updateUserProfile = async (payload) => {
  const res = await api.put("/user/updateUser", payload);
  return res.data;
};
