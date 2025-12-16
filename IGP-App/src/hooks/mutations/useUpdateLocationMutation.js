import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserProfile } from "../../api/user.api";
import Toast from "react-native-toast-message";

export const useUpdateLocationMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ city }) => {
      return await updateUserProfile({ city });
    },
    onSuccess: () => {
      qc.invalidateQueries(["currentUser"]);
    },
    onError: () => {
      Toast.show({
        type: "error",
        text1: "Failed to update location",
      });
    },
  });
};
