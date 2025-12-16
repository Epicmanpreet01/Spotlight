import { useQuery } from "@tanstack/react-query";
import { getMe } from "../../api/auth.api";

export const useCurrentUser = () =>
  useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        const res = await getMe();
        if (!res?.success) return null;
        return res;
      } catch {
        return null;
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
