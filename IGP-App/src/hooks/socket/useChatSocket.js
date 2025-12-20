// src/hooks/socket/useChatSocket.js
import { useEffect, useRef } from "react";
import { useSocket } from "../../context/SocketContext";
import { useQueryClient } from "@tanstack/react-query";

export const useChatSocket = (chatId, setOptimisticMessages) => {
  const { socket } = useSocket();
  const qc = useQueryClient();
  const joinedRef = useRef(false);

  useEffect(() => {
    if (!socket || !chatId) return;

    joinedRef.current = false;

    const joinChat = () => {
      if (!socket.connected) return; // 🔴 CRITICAL GUARD

      socket.emit("join_chat", { chatId }, (ack) => {
        if (ack?.success) {
          joinedRef.current = true;
          console.log("✅ JOINED CHAT");
        } else {
          console.warn("❌ JOIN FAILED:", ack?.error);
        }
      });
    };

    // ✅ join ONLY after connection
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
      joinedRef.current = false;
      socket.off("new_message", onNewMessage);
    };
  }, [chatId, socket]); // 🔥 socket MUST be in deps

  return { isJoinedRef: joinedRef };
};
