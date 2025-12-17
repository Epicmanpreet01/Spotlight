import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import {
  createBooking,
  acceptBooking,
  confirmBooking,
  completeBooking,
} from "../../api/booking.api";

/* ===================== CREATE ===================== */
export const useCreateBookingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Booking request sent",
        text2: "Waiting for performer to accept",
      });

      queryClient.invalidateQueries(["myBookings"]);
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
export const useAcceptBookingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acceptBooking,
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Booking accepted",
      });

      queryClient.invalidateQueries(["myBookings"]);
    },
  });
};

/* ===================== CONFIRM ===================== */
export const useConfirmBookingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: confirmBooking,
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Payment successful",
      });

      queryClient.invalidateQueries(["myBookings"]);
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

      queryClient.invalidateQueries(["myBookings"]);
    },
  });
};
