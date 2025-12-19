import { useQuery } from "@tanstack/react-query";
import { getPerformers, getPerformerById } from "../../api/performer.api";
import Toast from "react-native-toast-message";
import { useAuthGate } from "../useAuthGate";

export const usePerformersQuery = (filters = {}) => {
  const { isAuthed } = useAuthGate();

  return useQuery({
    queryKey: ["performers", filters],
    enabled: isAuthed,
    queryFn: () => getPerformers(filters),
    staleTime: 1000 * 60, // 1 min
    refetchOnWindowFocus: true,
    retry: false,
  });
};

export const usePerformerByIdQuery = (id) =>
  useQuery({
    queryKey: ["performer", id],
    enabled: !!id,
    queryFn: async () => {
      try {
        return await getPerformerById(id);
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Failed to load performer",
          text2: error?.message || "Please try again.",
        });
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 min
    refetchOnWindowFocus: false,
    retry: false,
  });
