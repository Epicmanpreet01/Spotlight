import { Stack, Redirect } from "expo-router";
import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

export default function AuthLayout() {
  const [checked, setChecked] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const saved = await SecureStore.getItemAsync("igp_token");
      setHasToken(!!saved);
      setChecked(true);
    };
    checkToken();
  }, []);

  if (!checked) return null;

  if (hasToken) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
