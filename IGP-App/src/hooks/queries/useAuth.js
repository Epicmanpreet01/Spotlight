import { useQuery } from "@tanstack/react-query";
import api from "../../api/api";

export const useCurrentUser = () =>
  useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const res = await api.get("/auth/me");
      return res.data;
    },
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
