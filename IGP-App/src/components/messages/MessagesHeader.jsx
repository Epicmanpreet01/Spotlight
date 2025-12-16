// src/components/messages/MessagesHeader.jsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../../src/context/ThemeContext";

export default function MessagesHeader() {
  const { theme } = useTheme();
  return (
    <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Messages</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { padding: 20, borderBottomWidth: 1 },
  title: { fontSize: 28, fontWeight: "bold" },
});
