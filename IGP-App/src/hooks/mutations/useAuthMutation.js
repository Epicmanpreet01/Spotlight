import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loginUser, signupUser, logoutUser } from "../../api/auth.api.js";
import Toast from "react-native-toast-message";
import { setAuthToken, getBackendErrorMessage } from "../../api/api.js";
import { router, useRouter } from "expo-router";
import { useTheme } from "../../context/ThemeContext";

export function useSignupMutation() {
  return useMutation({
    mutationFn: async (payload) => await signupUser(payload),
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Signup Failed",
        text2: getBackendErrorMessage(error),
      });
    },
    onSuccess: async (data) => {
      const token = data.token;

      if (!token) {
        Toast.show({
          type: "error",
          text1: "Signup Failed",
          text2: "No token acquired",
        });
        return;
      }

      await setAuthToken(token);

      // Redirect after successful SIGNUP
      router.replace("/(tabs)/home");
    },
  });
}

export function useSigninMutation() {
  const { setRoleTheme } = useTheme();

  return useMutation({
    mutationFn: loginUser,

    onSuccess: async (data) => {
      const token = data.token;
      const role = data.data?.role;

      await setAuthToken(token);

      setRoleTheme(role);

      router.replace("/(tabs)/home");
    },
  });
}

export const useLogoutMutation = () => {
  const router = useRouter();
  const { resetTheme } = useTheme();

  return useMutation({
    mutationFn: logoutUser,

    onSuccess: async () => {
      await setAuthToken(null);

      resetTheme();

      router.replace("/(auth)/sign-in");

      Toast.show({
        type: "success",
        text1: "Logged out",
      });
    },
  });
};
