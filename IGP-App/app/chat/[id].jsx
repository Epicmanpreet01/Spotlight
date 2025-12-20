// app/chat/[id].jsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import { FlatList, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "../../src/context/ThemeContext";
import { useQuery } from "@tanstack/react-query";
import api from "../../src/api/api";
import { useChatSocket } from "../../src/hooks/socket/useChatSocket";
import { useSocket } from "../../src/context/SocketContext";

import {
  ChatHeader,
  ChatMessageBubble,
  ChatInputBar,
} from "../../src/components/chat";

export default function ChatScreen() {
  const { id: chatId } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const listRef = useRef(null);

  const { socket, connected } = useSocket();
  const [optimisticMessages, setOptimisticMessages] = useState([]);

  /* ===================== CURRENT USER ===================== */
  const { data: userResp } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => (await api.get("/auth/me")).data,
    retry: false,
  });

  const currentUser = userResp?.data;

  /* ===================== CHAT META ===================== */
  const { data: chatResp } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => (await api.get(`/chat/${chatId}`)).data,
    enabled: !!chatId,
  });

  const chat = chatResp?.data;

  /* ===================== SOCKET JOIN ===================== */
  const { joined } = useChatSocket(chatId, setOptimisticMessages);

  /* ===================== CHAT MESSAGES ===================== */
  const { data: msgResp } = useQuery({
    queryKey: ["chatMessages", chatId],
    queryFn: async () => (await api.get(`/chat/${chatId}/messages`)).data,
    enabled: !!chatId && joined,
  });

  const serverMessages = msgResp?.data || [];

  /* ===================== MERGED MESSAGES ===================== */
  const messages = useMemo(() => {
    const map = new Map();
    serverMessages.forEach((m) => map.set(m._id, m));
    optimisticMessages.forEach((m) => map.set(m._id, m));
    return Array.from(map.values()).sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  }, [serverMessages, optimisticMessages]);

  /* ===================== AUTO SCROLL ===================== */
  useEffect(() => {
    if (!listRef.current || messages.length === 0) return;
    const t = setTimeout(
      () => listRef.current?.scrollToEnd({ animated: true }),
      80
    );
    return () => clearTimeout(t);
  }, [messages.length]);

  /* ===================== MARK READ ===================== */
  useEffect(() => {
    if (!chatId || !joined) return;
    api.put(`/chat/${chatId}/read`).catch(() => {});
  }, [chatId, joined]);

  /* ===================== SEND MESSAGE ===================== */
  const handleSend = (text) => {
    if (!text.trim() || !currentUser) return;
    if (!connected || !joined) return;

    const tempId = `tmp-${Date.now()}`;

    setOptimisticMessages((p) => [
      ...p,
      {
        _id: tempId,
        text,
        sender: currentUser,
        createdAt: new Date().toISOString(),
        __optimistic: true,
      },
    ]);

    socket.emit("send_message", { chatId, text }, (ack) => {
      if (!ack || ack.error) {
        api.post(`/chat/${chatId}/messages`, { text }).catch(() => {});
      }
    });
  };

  if (!chat || !currentUser) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
      />
    );
  }

  const otherUser = chat.members.find((m) => m._id !== currentUser._id);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ChatHeader user={otherUser} onBack={() => router.back()} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16, paddingBottom: 12 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ChatMessageBubble
              message={item}
              isMe={item.sender?._id === currentUser._id}
            />
          )}
        />

        <ChatInputBar onSend={handleSend} disabled={!connected || !joined} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
