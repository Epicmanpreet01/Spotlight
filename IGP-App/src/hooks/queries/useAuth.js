import { useQuery } from "@tanstack/react-query";
import { getMe } from "../../api/auth.api";
import Toast from "react-native-toast-message";

export const useCurrentUser = () =>
  useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        const res = await getMe();
        if (!res?.success && res?.error) {
          throw new Error(res.error);
        }
        return res;
      } catch (error) {
        console.error("❌ Error fetching current user:", error);
        Toast.show({
          type: "error",
          text1: "Failed to load user",
          text2: error.message || "Please try again.",
        });
        throw error;
      }
    },
    retry: 1,
  });
