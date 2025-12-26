// src/config/socket.js
import { io } from "socket.io-client";
import { API_BASE } from "../api/api.js";

export const createSocket = (token) => {
  if (!API_BASE) throw new Error("API_BASE not configured");
  const url = API_BASE.replace(/\/api\/?$/, "");
  const socket = io(url, {
    transports: ["websocket"],
    autoConnect: false,
    auth: { token },
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on("connect_error", (err) => {
    console.warn("Socket connect_error:", err.message);
  });

  socket.on("connect", () => {
    console.log("Socket connected", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  return socket;
};
