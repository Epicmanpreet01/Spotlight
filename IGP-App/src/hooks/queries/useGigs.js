import { useQuery } from "@tanstack/react-query";
import {
  fetchGigs,
  fetchGigById,
  fetchMyGigs,
  fetchAppliedGigs,
} from "../../api/gigs.api";
import Toast from "react-native-toast-message";
import { useAuthGate } from "../useAuthGate";

export const useGigsQuery = (filters = {}) => {
  const { isAuthed } = useAuthGate();

  return useQuery({
    queryKey: ["gigs", filters],
    enabled: isAuthed,
    queryFn: async () => {
      const res = await fetchGigs(filters);
      return res;
    },
    refetchOnWindowFocus: true,
    staleTime: 1000 * 30,
    retry: false,
  });
};

export const useGigByIdQuery = (id) =>
  useQuery({
    queryKey: ["gig", id],
    enabled: !!id,

    queryFn: async () => {
      try {
        const res = await fetchGigById(id);
        return res;
      } catch (error) {
        console.error("Failed to fetch gig:", error);

        Toast.show({
          type: "error",
          text1: "Failed to load gig",
          text2: error?.message || "Please try again.",
        });

        throw error;
      }
    },

    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    staleTime: 0,

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

    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    staleTime: 0,
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

    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    staleTime: 0,

    retry: false,
  });
};
