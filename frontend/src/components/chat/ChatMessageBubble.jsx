// src/components/chat/ChatMessageBubble.jsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext";

export default function ChatMessageBubble({ message, isMe }) {
  const { theme } = useTheme();

  if (!message || typeof message.text !== "string") {
    return null;
  }

  return (
    <View style={[styles.wrapper, isMe ? styles.right : styles.left]}>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isMe ? theme.colors.primary : theme.colors.card,
          },
        ]}
      >
        <Text
          style={{
            color: isMe ? "#fff" : theme.colors.text,
            fontSize: 15,
          }}
        >
          {message.text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 6,
    maxWidth: "80%",
  },
  left: {
    alignSelf: "flex-start",
  },
  right: {
    alignSelf: "flex-end",
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
});
