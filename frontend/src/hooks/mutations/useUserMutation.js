import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateUserProfile,
  updateUserProfileImage,
  deleteUserProfileImage,
} from "../../api/user.api";
import Toast from "react-native-toast-message";

export const useUpdateUserProfileMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      qc.invalidateQueries(["currentUser"]);
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Profile update failed",
        text2:
          error?.response?.data?.error || error?.message || "Please try again",
      });
    },
  });
};

export const useUpdateUserProfileImageMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfileImage,
    onSuccess: () => {
      qc.invalidateQueries(["currentUser"]);
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Image upload failed",
        text2:
          error?.response?.data?.error || error?.message || "Please try again",
      });
    },
  });
};

export const useDeleteUserProfileImageMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteUserProfileImage,
    onSuccess: () => {
      qc.invalidateQueries(["currentUser"]);
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Failed to delete image",
        text2:
          error?.response?.data?.error || error?.message || "Please try again",
      });
    },
  });
};
