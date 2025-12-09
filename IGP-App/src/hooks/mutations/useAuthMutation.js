import { useMutation } from "@tanstack/react-query";
import { loginUser, signupUser } from "../../api/auth.api.js";
import Toast from "react-native-toast-message";
import { setAuthToken, getBackendErrorMessage } from "../../api/api.js";
import { router } from "expo-router";

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
  return useMutation({
    mutationFn: async (payload) => await loginUser(payload),
    onError: (error) => {
      const backendMessage = getBackendErrorMessage(error);
      Toast.show({
        type: "error",
        text1: "Login failed",
        text2: backendMessage,
      });
    },
    onSuccess: async (data) => {
      const token = data.token;
      if (!token) {
        Toast.show({
          type: "error",
          text1: "Login failed",
          text2: "No token acquired",
        });
        return;
      }

      await setAuthToken(token);

      // Redirect after LOGIN
      router.replace("/(tabs)/home");
    },
  });
}
