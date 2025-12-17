import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { createGig } from "../../api/gigs.api";

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
