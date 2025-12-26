import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../src/context/ThemeContext";

/* ===================== HOOKS ===================== */
import { useCurrentUser } from "../../src/hooks/queries/useAuth";
import { useMyChatsQuery } from "../../src/hooks/queries/useChats";

/* ===================== COMPONENTS ===================== */
/* Performer messages */
import MessagesHeader from "../../src/components/messages/MessagesHeader";
import ChatList from "../../src/components/messages/ChatList";
import EmptyMessages from "../../src/components/messages/EmptyMessages";

/* Booker messages */
import BookerMessagesHeader from "../../src/components/booker/messages/BookerMessagesHeader";
import BookerChatList from "../../src/components/booker/messages/BookerChatList";
import BookerEmptyMessages from "../../src/components/booker/messages/BookerEmptyMessages";

export default function MessagesScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  /* ===================== CURRENT USER ===================== */
  const { data: me } = useCurrentUser();
  const role = me?.data?.role;
  const isBooker = role === "booker";

  /* ===================== CHATS ===================== */
  const { data: chatsResp, isLoading } = useMyChatsQuery();
  const chats = chatsResp?.data || [];

  /* ===================== ROLE BASED COMPONENTS ===================== */
  const Header = isBooker ? BookerMessagesHeader : MessagesHeader;
  const List = isBooker ? BookerChatList : ChatList;
  const Empty = isBooker ? BookerEmptyMessages : EmptyMessages;

  /* ===================== OPEN CHAT ===================== */
  const handleOpenChat = (chat) => {
    router.push(`/chat/${chat._id}`);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* HEADER */}
      <Header />

      {/* CONTENT */}
      <View style={styles.content}>
        {isLoading ? null : chats.length === 0 ? (
          <Empty />
        ) : (
          <List chats={chats} onPressChat={handleOpenChat} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});
