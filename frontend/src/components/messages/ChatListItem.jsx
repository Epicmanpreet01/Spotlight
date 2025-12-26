import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { IMAGES } from "../../constants/images";

export default function ChatListItem({
  avatar,
  name,
  message,
  time,
  unread,
  onPress,
}) {
  const { theme } = useTheme();

  const messageText =
    typeof message === "string" ? message : message?.text || "No messages yet";

  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <Image
        source={avatar ? { uri: avatar } : IMAGES.NO_AVATAR}
        style={styles.avatar}
      />

      <View style={styles.center}>
        <Text style={[styles.name, { color: theme.colors.text }]}>
          {name || "Unknown"}
        </Text>
        <Text style={{ color: theme.colors.textSecondary }} numberOfLines={1}>
          {messageText}
        </Text>
      </View>

      <View style={styles.right}>
        <Text style={styles.time}>{time}</Text>

        {unread > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unread}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", padding: 16, alignItems: "center" },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  center: { flex: 1, marginLeft: 12 },
  right: { alignItems: "flex-end" },
  name: { fontWeight: "700", fontSize: 15 },
  time: { fontSize: 11, color: "#999", marginBottom: 4 },
  badge: {
    backgroundColor: "#00BCD4",
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
});
