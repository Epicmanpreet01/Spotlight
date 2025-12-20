import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../src/context/ThemeContext";

export default function ChatInputBar({ onSend, disabled = false }) {
  const { theme } = useTheme();
  const [text, setText] = useState("");

  const handleSend = () => {
    if (disabled || !text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card,
          opacity: disabled ? 0.6 : 1,
        },
      ]}
    >
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={disabled ? "Connecting…" : "Type a message"}
        placeholderTextColor={theme.colors.textSecondary}
        style={[styles.input, { color: theme.colors.text }]}
        editable={!disabled} // 🔑 disables typing
      />

      <TouchableOpacity
        onPress={handleSend}
        disabled={disabled} // 🔑 disables button
        style={{ opacity: disabled ? 0.5 : 1 }}
      >
        <Ionicons
          name="send"
          size={22}
          color={disabled ? theme.colors.textSecondary : theme.colors.primary}
        />
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
