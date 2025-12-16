import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../context/ThemeContext";
import { useRouter } from "expo-router";

export default function BookerHomeHeader({
  user = {},
  unreadCount = 0,
  onPressLocation,
  onPressNotifications,
}) {
  const { theme } = useTheme();
  const router = useRouter();

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
            Hello, {user?.name ? user.name.split(" ")[0] : "User"}!
          </Text>

          {/* LOCATION */}
          <TouchableOpacity
            onPress={onPressLocation}
            style={styles.locationRow}
            activeOpacity={0.7}
          >
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
            <Ionicons
              name="pencil"
              size={14}
              color={theme.colors.textSecondary}
              style={{ marginLeft: 6 }}
            />
          </TouchableOpacity>
        </View>

        {/* NOTIFICATION BELL */}
        <TouchableOpacity
          onPress={handlePressBell}
          style={styles.bellWrap}
          activeOpacity={0.7}
        >
          <Ionicons
            name="notifications-outline"
            size={24}
            color={theme.colors.text}
          />

          {unreadCount > 0 && (
            <View
              style={[styles.badge, { backgroundColor: theme.colors.primary }]}
            >
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 12 },
  row: { flexDirection: "row", alignItems: "center" },
  greeting: { fontSize: 24, fontWeight: "800" },
  locationRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  locationText: { marginLeft: 6, fontSize: 13 },
  bellWrap: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
});
