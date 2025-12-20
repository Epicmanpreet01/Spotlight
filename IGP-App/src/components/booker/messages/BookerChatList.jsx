import React from "react";
import { FlatList } from "react-native";
import BookerChatListItem from "./BookerChatListItem";
import { useCurrentUser } from "../../../hooks/queries/useAuth";

export default function BookerChatList({ chats = [], onPressChat = () => {} }) {
  const { data: me } = useCurrentUser();
  const myId = me?.data?._id;

  const renderItem = ({ item }) => {
    const otherUser = item.members.find((m) => m._id !== myId);

    const unread = item.unreadCounts?.find((u) => u.user === myId)?.count || 0;

    return (
      <BookerChatListItem
        avatar={otherUser?.profileImage}
        name={otherUser?.name}
        message={item.lastMessage}
        time={new Date(item.updatedAt).toLocaleDateString()}
        unread={unread}
        onPress={() => onPressChat(item)}
      />
    );
  };

  return (
    <FlatList
      data={chats}
      keyExtractor={(item) => item._id}
      showsVerticalScrollIndicator={false}
      renderItem={renderItem}
    />
  );
}
