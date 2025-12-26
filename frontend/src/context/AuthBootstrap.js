import { Slot } from "expo-router";
import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import { setAuthToken } from "../api/api";
import { useTheme } from "./ThemeContext";
import { SocketProvider } from "./SocketContext";
import { View } from "react-native";
import Toast from "react-native-toast-message";

export default function AuthBootstrap() {
  const [token, setToken] = useState(null);
  const { setRoleTheme } = useTheme();

  useEffect(() => {
    const bootstrap = async () => {
      const saved = await SecureStore.getItemAsync("igp_token");
      if (!saved) return;

      await setAuthToken(saved);
      setToken(saved);

      const decoded = jwtDecode(saved);
      if (decoded?.role) {
        setRoleTheme(decoded.role);
      }
    };

    bootstrap();
  }, []);

  return (
    <SocketProvider token={token}>
      <View style={{ flex: 1 }}>
        <Slot />
        <Toast />
      </View>
    </SocketProvider>
  );
}
