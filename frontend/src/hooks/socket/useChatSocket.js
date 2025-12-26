// src/hooks/socket/useChatSocket.js
import { useEffect, useState } from "react";
import { useSocket } from "../../context/SocketContext";
import { useQueryClient } from "@tanstack/react-query";

export const useChatSocket = (chatId, setOptimisticMessages) => {
  const { socket } = useSocket();
  const qc = useQueryClient();
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!socket || !chatId) return;

    setJoined(false);

    const joinChat = () => {
      if (!socket.connected) return;

      socket.emit("join_chat", { chatId }, (ack) => {
        if (ack?.success) {
          console.log("✅ JOINED CHAT");
          setJoined(true);
        } else {
          console.warn("❌ JOIN FAILED:", ack?.error);
          setJoined(false);
        }
      });
    };

    if (socket.connected) {
      joinChat();
    } else {
      socket.once("connect", joinChat);
    }

    const onNewMessage = ({ chatId: id, message }) => {
      if (id !== chatId) return;

      qc.setQueryData(["chatMessages", chatId], (old) => {
        const prev = old?.data || [];
        if (prev.some((m) => m._id === message._id)) return old;
        return { ...old, data: [...prev, message] };
      });

      setOptimisticMessages((prev) => prev.filter((m) => !m.__optimistic));
    };

    socket.on("new_message", onNewMessage);

    return () => {
      socket.off("new_message", onNewMessage);
      setJoined(false);
    };
  }, [chatId, socket]);

  return { joined };
};
