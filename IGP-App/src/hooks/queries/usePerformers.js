import { useQuery } from "@tanstack/react-query";
import { getPerformers, getPerformerById } from "../../api/performer.api";
import Toast from "react-native-toast-message";

export const usePerformersQuery = (filters = {}, enabled = true) =>
  useQuery({
    queryKey: ["performers", filters],
    enabled,
    queryFn: async () => {
      try {
        const res = await getPerformers(filters);
        return res;
      } catch (error) {
        console.error("Error fetching performers:", error);

        Toast.show({
          type: "error",
          text1: "Failed to load performers",
          text2: error?.message || "Please try again.",
        });

        return null;
      }
    },
    retry: false,
  });

export const usePerformerByIdQuery = (id) =>
  useQuery({
    queryKey: ["performer", id],
    enabled: !!id,
    queryFn: async () => {
      try {
        const res = await getPerformerById(id);
        return res;
      } catch (error) {
        console.error(`Error fetching performer (${id}):`, error);

        Toast.show({
          type: "error",
          text1: "Failed to load performer",
          text2: error?.message || "Please try again.",
        });

        return null;
      }
    },
    retry: false,
  });
