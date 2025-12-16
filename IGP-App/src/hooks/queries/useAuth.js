import { useQuery } from "@tanstack/react-query";
import api from "../../api/api";

export const useCurrentUser = () =>
  useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        const res = await api.get("/auth/me");
        return res.data;
      } catch {
        return null;
      }
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: false,
  });
