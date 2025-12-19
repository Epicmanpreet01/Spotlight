import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";

import {
  createBooking,
  acceptBooking,
  confirmBooking,
  completeBooking,
  cancelBooking,
} from "../../api/booking.api";

/* ===================== CREATE ===================== */
export const useCreateBookingMutation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Booking request sent",
        text2: "Waiting for performer to accept",
      });
      queryClient.invalidateQueries(["myBookings"]);
      queryClient.invalidateQueries(["myGigs"]);
      queryClient.invalidateQueries(["notifications"]);

      router.replace("/(tabs)/profile");
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Failed to create booking",
        text2: error?.response?.data?.error || "Please try again",
      });
    },
  });
};

/* ===================== ACCEPT ===================== */
export const useAcceptBookingMutation = (id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => acceptBooking(id),
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Booking accepted",
      });

      queryClient.invalidateQueries(["myBookings"]);
      queryClient.invalidateQueries(["gigs"]);
      queryClient.invalidateQueries(["appliedGigs"]);
      queryClient.invalidateQueries(["gig"]);
      queryClient.invalidateQueries(["notifications"]);
      queryClient.invalidateQueries(["booking", id]);
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Failed to create booking",
        text2: error?.response?.data?.error || "Please try again",
      });
    },
  });
};

/* ===================== CONFIRM ===================== */
export const useConfirmBookingMutation = (id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => confirmBooking(id),
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Payment successful",
      });

      queryClient.invalidateQueries(["myBookings"]);
      queryClient.invalidateQueries(["notifications"]);
      queryClient.invalidateQueries(["booking", id]);
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Failed to create booking",
        text2: error?.response?.data?.error || "Please try again",
      });
    },
  });
};

/* ===================== COMPLETE ===================== */
export const useCompleteBookingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }) => completeBooking(id, body),
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Booking completed",
      });

      queryClient.invalidateQueries(["booking"]);
      queryClient.invalidateQueries(["myBookings"]);
      queryClient.invalidateQueries(["notifications"]);
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Failed to create booking",
        text2: error?.response?.data?.error || "Please try again",
      });
    },
  });
};

export const useCancelBookingMutation = (id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cancelBooking(id),
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Booking completed",
      });

      queryClient.invalidateQueries(["booking"]);
      queryClient.invalidateQueries(["myBookings"]);
      queryClient.invalidateQueries(["notifications"]);
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Failed to create booking",
        text2: error?.response?.data?.error || "Please try again",
      });
    },
  });
};
