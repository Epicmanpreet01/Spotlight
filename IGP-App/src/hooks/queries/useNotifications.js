import { useQuery } from "@tanstack/react-query";
import api from "../../api/api";
import { useAuthGate } from "../useAuthGate";

export const useNotifications = () => {
  const { isAuthed } = useAuthGate();

  return useQuery({
    queryKey: ["notifications"],
    enabled: isAuthed,
    queryFn: async () => {
      const res = await api.get("/notifications");
      return res?.data?.data || [];
    },
    refetchInterval: isAuthed ? 5000 : false,
    staleTime: 1000 * 30,
    retry: false,
  });
};
