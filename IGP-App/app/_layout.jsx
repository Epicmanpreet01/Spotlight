import { ThemeProvider } from "../src/context/ThemeContext";
import { Slot } from "expo-router";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SocketProvider } from "../src/context/SocketContext.js";
import { setAuthToken } from "../src/api/api.js";
import * as SecureStore from "expo-secure-store";
import Toast from "react-native-toast-message";

const queryClient = new QueryClient();

export default function RootLayout() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const saved = await SecureStore.getItemAsync("igp_token");
        if (saved) {
          setToken(saved);
          await setAuthToken(saved);
        }
      } catch (e) {
        console.warn("Failed to load token", e);
      }
    };
    loadToken();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SocketProvider token={token}>
          <View style={{ flex: 1 }}>
            <Slot />
            <Toast />
          </View>
        </SocketProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
