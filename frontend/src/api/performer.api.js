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

export const addPerformerGalleryImages = async (assets = []) => {
  const formData = new FormData();

  assets.forEach((asset, index) => {
    const isVideo = asset.type === "video";

    formData.append("images", {
      uri: asset.uri,
      name: `gallery_${Date.now()}_${index}.${isVideo ? "mp4" : "jpg"}`,
      type: isVideo ? "video/mp4" : "image/jpeg",
    });
  });

  const res = await api.put("/performers/profile/add/images", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

/* ================= REMOVE GALLERY IMAGE ================= */
export const removePerformerGalleryImage = async ({ imageUrl }) => {
  const res = await api.post("/performers/profile/delete/image", { imageUrl });
  return res.data;
};
