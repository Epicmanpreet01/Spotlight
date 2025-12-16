import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserProfile } from "../../api/user.api";
import Toast from "react-native-toast-message";
import { getBackendErrorMessage } from "../../api/api";

export const useUpdateLocationMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ city, location }) => {
      if (!city || !location?.coordinates?.length) {
        throw new Error("Invalid location payload");
      }
      return updateUserProfile({ city, location });
    },
    onSuccess: () => {
      qc.invalidateQueries(["currentUser"]);
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Failed to update location",
        text2: getBackendErrorMessage(error),
      });
    },
  });
};
