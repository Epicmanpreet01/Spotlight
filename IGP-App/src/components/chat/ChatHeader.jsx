// src/components/chat/ChatHeader.jsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { IMAGES } from "../../constants/images";

export default function ChatHeader({ user, onBack }) {
  const { theme } = useTheme();

  if (!user) return null;

  const avatar = user.profileImage
    ? { uri: user.profileImage }
    : IMAGES.NO_AVATAR;

  return (
    <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
      <TouchableOpacity onPress={onBack}>
        <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
      </TouchableOpacity>

      <View style={styles.userBox}>
        {avatar ? (
          <Image source={avatar} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, { backgroundColor: "#ddd" }]} />
        )}

        <Text style={[styles.name, { color: theme.colors.text }]}>
          {user.name}
        </Text>
      </View>

      <View style={{ width: 24 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  userBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
  },
});
