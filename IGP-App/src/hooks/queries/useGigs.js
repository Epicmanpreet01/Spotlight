import { useQuery } from "@tanstack/react-query";
import { fetchGigs, fetchGigById } from "../../api/gigs.api";
import Toast from "react-native-toast-message";

export const useGigsQuery = (filters = {}, enabled = true) =>
  useQuery({
    queryKey: ["gigs", filters],
    enabled,
    queryFn: async () => {
      try {
        const res = await fetchGigs(filters);
        return res;
      } catch (error) {
        console.error("❌ Failed to fetch gigs:", error);

        Toast.show({
          type: "error",
          text1: "Failed to load gigs",
          text2: error?.message || "Please try again.",
        });

        return null;
      }
    },
    retry: false,
  });

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

        return null;
      }
    },
    retry: false,
  });
