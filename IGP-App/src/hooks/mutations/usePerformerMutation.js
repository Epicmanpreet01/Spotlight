import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

/* ================= API ================= */
import {
  updatePerformerProfile,
  addPerformerGalleryImages,
  removePerformerGalleryImage,
} from "../../api/performer.api";

/* ================= UPDATE PROFILE ================= */
export const useUpdatePerformerProfileMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: updatePerformerProfile,

    onSuccess: () => {
      qc.invalidateQueries(["currentUser"]);
      qc.invalidateQueries(["performerProfile"]);
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

/* ================= ADD GALLERY IMAGES ================= */
export const useAddGalleryImagesMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: addPerformerGalleryImages,

    onSuccess: () => {
      qc.invalidateQueries(["currentUser"]);
      qc.invalidateQueries(["performerProfile"]);
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

/* ================= REMOVE GALLERY IMAGE ================= */
export const useRemoveGalleryImageMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: removePerformerGalleryImage,

    onSuccess: () => {
      qc.invalidateQueries(["currentUser"]);
      qc.invalidateQueries(["performerProfile"]);
    },

    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Image removal failed",
        text2:
          error?.response?.data?.error || error?.message || "Please try again",
      });
    },
  });
};
