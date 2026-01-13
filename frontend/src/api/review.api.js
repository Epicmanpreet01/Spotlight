import api from "./api";

export const createReview = async ({ bookingId, rating, comment }) => {
  const res = await api.post(`/reviews/booking/${bookingId}`, {
    rating,
    comment,
  });
  return res.data;
};

export const updateReview = async ({ reviewId, rating, comment }) => {
  const res = await api.put(`/reviews/${reviewId}`, {
    rating,
    comment,
  });
  return res.data;
};

export const deleteReview = async (reviewId) => {
  const res = await api.delete(`/reviews/${reviewId}`);
  return res.data;
};

export const getReviewsForPerformer = async (performerId) => {
  const res = await api.get(`/reviews/performer/${performerId}`);
  return res.data;
};
