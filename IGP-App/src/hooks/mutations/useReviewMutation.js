// src/hooks/useReviewMutation.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createReview, updateReview, deleteReview } from "../../api/review.api";
import Toast from "react-native-toast-message";

export const useCreateReviewMutation = (bookingId) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ rating, comment }) =>
      createReview({ bookingId, rating, comment }),
    onSuccess: (res) => {
      const review = res?.data;
      qc.invalidateQueries(["booking", bookingId]);
      qc.invalidateQueries(["myBookings"]);
      qc.invalidateQueries(["performer", review.performer]);

      Toast.show({
        type: "success",
        text1: "Review noted",
        text2: "your review has been noted",
      });
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Failed to record review",
        text2: error?.response?.data?.error || "Something went wrong",
      });
    },
  });
};

export const useUpdateReviewMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: updateReview,
    onSuccess: () => {
      qc.invalidateQueries(["myBookings"]);
    },
  });
};

export const useDeleteReviewMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      qc.invalidateQueries(["myBookings"]);
    },
  });
};
