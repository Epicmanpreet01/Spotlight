import axios from "axios";
import * as SecureStore from "expo-secure-store";

export const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";

console.log(API_BASE);

const api = axios.create({
  baseURL: API_BASE,
  timeout: 20000,
});

export const getBackendErrorMessage = (error) => {
  return (
    error.response?.data?.error ||
    error.response?.data?.message ||
    error.message ||
    "Something went wrong"
  );
};

export const setAuthToken = async (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    try {
      await SecureStore.setItemAsync("igp_token", token);
    } catch (e) {
      console.warn("Failed to save token to SecureStore", e);
    }
  } else {
    delete api.defaults.headers.common["Authorization"];

    try {
      await SecureStore.deleteItemAsync("igp_token");
    } catch (e) {
      console.warn("Failed to delete token from SecureStore", e);
    }
  }
};

(async () => {
  try {
    const saved = await SecureStore.getItemAsync("igp_token");
    if (saved) setAuthToken(saved);
  } catch (e) {
    console.warn(`No token found: ${e}`);
  }
})();

export default api;
