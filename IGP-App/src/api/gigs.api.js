import api from "../api/api.js";

export const fetchGigs = async (filters = {}) => {
  const res = await api.get("/gigs", { params: filters });
  return res.data;
};

export const fetchGigById = async (id) => {
  const res = await api.get(`/gigs/${id}`);
  return res.data;
};

export const createGig = async (formData) => {
  // formData should be instance of FormData, include previewImage file under 'previewImage'
  const res = await api.post("/gigs/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const applyToGig = async (gigId, body) => {
  const res = await api.post(`/gigs/${gigId}/apply`, body);
  return res.data;
};

export const fetchMyGigs = async () => {
  const res = await api.get("/gigs/my");
  return res.data;
};

export const withdrawFromGig = async (gigId) => {
  const res = await api.post(`/gigs/${gigId}/withdraw`);
  return res.data;
};
