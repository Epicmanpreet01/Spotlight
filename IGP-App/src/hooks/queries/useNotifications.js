import { useQuery } from "@tanstack/react-query";
import api from "../../api/api";

export const useNotifications = () =>
  useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      try {
        const res = await api.get("/notifications");
        return res?.data?.data || [];
      } catch (error) {
        console.warn("Failed to fetch notifications:", error?.message);
        return [];
      }
    },
    refetchInterval: 5000,
    staleTime: 1000 * 30,
    retry: false,
  });
