import { useQuery } from "@tanstack/react-query";
import api from "../../api/api";

export const useNotifications = () =>
  useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await api.get("/notifications");
      return res.data.data || [];
    },
    refetchInterval: 5000,
    staleTime: 1000 * 30,
  });
