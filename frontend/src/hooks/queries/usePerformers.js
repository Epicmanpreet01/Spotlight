import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { getPerformers, getPerformerById } from "../../api/performer.api";
import Toast from "react-native-toast-message";
import { useAuthGate } from "../useAuthGate";

export const usePerformersQuery = (filters = {}, enabled = true) => {
  const { isAuthed } = useAuthGate();

  return useInfiniteQuery({
    queryKey: ["performers", filters],
    enabled: isAuthed && enabled,
    queryFn: ({ pageParam = 1 }) =>
      getPerformers({ ...filters, page: pageParam, limit: 10 }),

    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage;
      if (!pagination) return undefined;

      return pagination.page < pagination.pages
        ? pagination.page + 1
        : undefined;
    },

    staleTime: 1000 * 60,
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
