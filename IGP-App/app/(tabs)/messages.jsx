// app/(tabs)/messages.jsx
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, StyleSheet } from "react-native";
import { useQuery } from "@tanstack/react-query";
import api from "../../src/api/api";
import { useTheme } from "../../src/context/ThemeContext";

// Performer message components
import {
  MessagesHeader,
  ChatListItem,
  EmptyMessages,
} from "../../src/components/messages";

// Booker message components
import {
  BookerMessagesHeader,
  BookerChatListItem,
  BookerEmptyMessages,
} from "../../src/components/booker/messages";

export default function MessagesScreen() {
  const { theme } = useTheme();

  /* ===== CURRENT USER ===== */
  const { data: userResp } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        return (await api.get("/auth/me")).data;
      } catch {
        return null;
      }
    },
    retry: false,
  });

  const user = userResp?.data;
  const role = user?.role;

  /* ===== WHICH COMPONENT SET TO USE ===== */
  const isBooker = role === "booker";

  const Header = isBooker ? BookerMessagesHeader : MessagesHeader;
  const Item = isBooker ? BookerChatListItem : ChatListItem;
  const Empty = isBooker ? BookerEmptyMessages : EmptyMessages;

  /* ===== FETCH CHATS ===== */
  const { data: chatsResp } = useQuery({
    queryKey: ["myChats"],
    queryFn: async () => (await api.get("/chat")).data,
    retry: false,
  });

  const chats = chatsResp?.data || [];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* HEADER (Booker / Performer) */}
      <Header />

      {/* CONTENT */}
      <View style={styles.content}>
        {/* No chats */}
        {chats.length === 0 ? (
          <Empty />
        ) : (
          <View style={{ width: "100%", padding: 20 }}>
            {chats.map((chat) => (
              <Item
                key={chat._id}
                chat={chat}
                onPress={() => console.log("Open chat", chat._id)}
              />
            ))}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});
