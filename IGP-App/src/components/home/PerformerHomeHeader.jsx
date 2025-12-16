import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";

import api from "../../api/api";
import { useTheme } from "../../context/ThemeContext";

export default function PerformerHomeHeader({
  user = {},
  onPressNotifications,
}) {
  const router = useRouter();
  const { theme } = useTheme();

  // Location display: prefer user.city (from API). Allow small mock "Detect" button if not present.
  const [location, setLocation] = useState(user?.city || "");

  useEffect(() => {
    if (user?.city) setLocation(user.city);
  }, [user?.city]);

  // Notifications polling: refetchInterval simulates near real-time updates.
  const { data: notData, isFetching } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (await api.get("/notifications")).data,
    // poll every 5s to simulate real-time updates; change as needed
    refetchInterval: 5000,
    keepPreviousData: true,
  });

  const notifications = Array.isArray(notData?.data) ? notData.data : [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Small mock detect function (you can replace with Expo Location later)
  const handleDetectLocation = () => {
    // simple mock: sets Mumbai after a small delay
    setLocation("Detecting...");
    setTimeout(() => setLocation("Mumbai"), 900);
  };

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
            Hello, {user?.name ? user.name.split(" ")[0] : "Mock"}!
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
              {location ? location : "Set your location"}
            </Text>

            {/* Detect small action */}
            {!location && (
              <TouchableOpacity
                onPress={handleDetectLocation}
                style={styles.detectBtn}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.detectText, { color: theme.colors.primary }]}
                >
                  Detect
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Notification bell */}
        <TouchableOpacity
          onPress={handlePressBell}
          style={styles.bellWrap}
          activeOpacity={0.8}
        >
          <View style={[styles.bellBg, { backgroundColor: theme.colors.card }]}>
            {isFetching ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Ionicons
                name="notifications-outline"
                size={22}
                color={theme.colors.primary}
              />
            )}
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
  locationRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  locationText: { marginLeft: 6, fontSize: 13 },
  detectBtn: {
    marginLeft: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  detectText: { fontSize: 13, fontWeight: "700" },

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
    backgroundColor: "#FF3B30", // red badge
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
});
