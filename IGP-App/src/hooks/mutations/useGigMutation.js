import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { createGig, applyToGig, withdrawFromGig } from "../../api/gigs.api";

export const useCreateGigMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGig,

    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Event created successfully",
      });

      // Refresh booker's gigs
      queryClient.invalidateQueries(["myGigs"]);
      queryClient.invalidateQueries(["currentUser"]);
    },

    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Failed to create event",
        text2: error?.response?.data?.error || "Something went wrong",
      });
    },
  });
};

export const useApplyToGigMutation = (gigId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body) => applyToGig(gigId, body),

    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Applied successfully",
        text2: "The organizer will contact you",
      });

      queryClient.invalidateQueries(["gig", gigId]);
      queryClient.invalidateQueries(["gigs"]);
    },

    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Failed to apply",
        text2: error?.response?.data?.error || "Something went wrong",
      });
    },
  });
};

export const useWithdrawFromGigMutation = (gigId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => withdrawFromGig(gigId),

    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Application withdrawn",
      });

      queryClient.invalidateQueries(["gig", gigId]);
      queryClient.invalidateQueries(["gigs"]);
    },

    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Failed to withdraw",
        text2: error?.response?.data?.error || "Something went wrong",
      });
    },
  });
};
