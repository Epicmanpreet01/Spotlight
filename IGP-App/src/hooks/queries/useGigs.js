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
    queryFn: () => fetchGigs(filters),
    staleTime: 1000 * 15, // 15s
    refetchOnWindowFocus: true,
    refetchOnMount: true,
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
