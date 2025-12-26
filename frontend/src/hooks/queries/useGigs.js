import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import {
  fetchGigs,
  fetchGigById,
  fetchMyGigs,
  fetchAppliedGigs,
} from "../../api/gigs.api";
import Toast from "react-native-toast-message";
import { useAuthGate } from "../useAuthGate";

export const useGigsQuery = (filters = {}, enabled = true) => {
  const { isAuthed } = useAuthGate();

  return useInfiniteQuery({
    queryKey: ["gigs", filters],
    enabled: isAuthed && enabled,
    queryFn: ({ pageParam = 1 }) =>
      fetchGigs({ ...filters, page: pageParam, limit: 10 }),

    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage;
      if (!pagination) return undefined;

      return pagination.page < pagination.pages
        ? pagination.page + 1
        : undefined;
    },

    staleTime: 1000 * 15,
    retry: false,
  });
};

export const useGigByIdQuery = (id) =>
  useQuery({
    queryKey: ["gig", id],
    enabled: !!id,
    queryFn: async () => {
      try {
        return await fetchGigById(id);
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Failed to load gig",
          text2: error?.message || "Please try again.",
        });
        throw error;
      }
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    retry: false,
  });

export const useMyGigsQuery = () => {
  const { isAuthed } = useAuthGate();

  return useQuery({
    queryKey: ["myGigs"],
    enabled: isAuthed,
    queryFn: async () => {
      const res = await fetchMyGigs();
      return res.data;
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    retry: false,
  });
};

export const useAppliedGigsQuery = () => {
  const { isAuthed } = useAuthGate();

  return useQuery({
    queryKey: ["appliedGigs"],
    enabled: isAuthed,
    queryFn: async () => {
      const res = await fetchAppliedGigs();
      return res.data;
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    retry: false,
  });
};
