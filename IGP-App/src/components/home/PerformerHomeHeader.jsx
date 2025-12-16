import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useTheme } from "../../context/ThemeContext";
import { useNotifications } from "../../hooks/queries/useNotifications";

export default function PerformerHomeHeader({
  user = {},
  onPressNotifications,
}) {
  const router = useRouter();
  const { theme } = useTheme();

  /* ===================== NOTIFICATIONS ===================== */
  const { data: notifications = [] } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handlePressBell = () => {
    if (typeof onPressNotifications === "function") {
      onPressNotifications();
    } else {
      router.push("/notifications");
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.greeting, { color: theme.colors.text }]}>
            Hello, {user?.name ? user.name.split(" ")[0] : "Artist"}!
          </Text>

          <View style={styles.locationRow}>
            <Ionicons
              name="location-outline"
              size={14}
              color={theme.colors.textSecondary}
            />
            <Text
              style={[
                styles.locationText,
                { color: theme.colors.textSecondary },
              ]}
            >
              {user?.city || "Set your location"}
            </Text>
          </View>
        </View>

        {/* NOTIFICATION BELL */}
        <TouchableOpacity
          onPress={handlePressBell}
          style={styles.bellWrap}
          activeOpacity={0.8}
        >
          <View style={[styles.bellBg, { backgroundColor: theme.colors.card }]}>
            <Ionicons
              name="notifications-outline"
              size={22}
              color={theme.colors.primary}
            />

            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? "99+" : String(unreadCount)}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  row: { flexDirection: "row", alignItems: "center" },
  greeting: { fontSize: 24, fontWeight: "800" },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  locationText: { marginLeft: 6, fontSize: 13 },

  bellWrap: { marginLeft: 12 },
  bellBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    elevation: 2,
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    minWidth: 18,
    paddingHorizontal: 5,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
});
