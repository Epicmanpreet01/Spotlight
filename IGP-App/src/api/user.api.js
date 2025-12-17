import api from "./api";

export const getCurrentUser = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};

export const updateUserProfile = async (payload) => {
  const res = await api.put("/user/updateUser", payload);
  return res.data;
};

export const updateUserProfileImage = async (imageAsset) => {
  const formData = new FormData();

  formData.append("image", {
    uri: imageAsset.uri,
    name: "profile.jpg",
    type: "image/jpeg",
  });

  const res = await api.put("/user/updateUserImage", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

export const deleteUserProfileImage = async () => {
  const res = await api.delete("/user/deleteUserImage");
  return res.data;
};
