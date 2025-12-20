import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../src/context/ThemeContext";

export default function ChatInputBar({ onSend }) {
  const { theme } = useTheme();
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Type a message"
        placeholderTextColor={theme.colors.textSecondary}
        style={[styles.input, { color: theme.colors.text }]}
      />

      <TouchableOpacity onPress={handleSend}>
        <Ionicons name="send" size={22} color={theme.colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  input: {
    flex: 1,
    marginRight: 10,
    fontSize: 16,
  },
});
