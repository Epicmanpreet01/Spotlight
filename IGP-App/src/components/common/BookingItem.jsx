import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../../context/ThemeContext";

export default function BookingItem({
  booking = {},
  role = "booker", // "booker" | "performer"
  onPress,
}) {
  const { theme } = useTheme();

  /* ===================== SAFE DERIVED VALUES ===================== */
  const status = booking?.status || "pending";

  const STATUS_COLORS = {
    confirmed: "#2E7D32",
    pending: "#FF9800",
    declined: role === "performer" ? "#D32F2F" : "#1976D2",
    cancelled: "#D32F2F",
    completed: "#1976D2",
  };

  const statusColor = STATUS_COLORS[status] || "#1976D2";

  const title = booking?.gig?.title || "Event";
  const address = booking?.gig?.location?.address || "Location not specified";

  const dateText = booking?.eventDate?.start
    ? new Date(booking.eventDate.start).toLocaleDateString()
    : "Date not set";

  const price = booking?.totalPrice ?? (role === "performer" ? "--" : 0);

  const formatAddress = (addr = "") => addr.split(",").slice(0, 2).join(", ");

  /* ===================== RENDER ===================== */
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.card, { borderColor: theme.colors.border }]}
      onPress={onPress}
    >
      {/* 🔥 LEFT SECTION (CONSTRAINED) */}
      <View style={styles.leftSection}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {title}
        </Text>

        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[
            styles.subtitle,
            { color: theme.colors.textSecondary },
          ]}
        >
          {dateText} • {formatAddress(address)}
        </Text>
      </View>

      {/* 🔥 RIGHT SECTION (FIXED WIDTH, NEVER OVERFLOWS) */}
      <View style={styles.rightSection}>
        <Text style={{ color: statusColor, fontWeight: "700" }}>
          {status.toUpperCase()}
        </Text>

        <Text style={{ marginTop: 6, fontWeight: "700", color: "#FF6F00" }}>
          ₹{price}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

/* ===================== STYLES (ONLY ADDITIONS) ===================== */
const styles = StyleSheet.create({
  card: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    marginBottom: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", // 🔥 ADDED (vertical alignment)
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },

  /* 🔥 ADDED STYLES */
  leftSection: {
    flex: 1,          // takes remaining space
    flexShrink: 1,    // can shrink
    paddingRight: 12, // space from right column
  },
  subtitle: {
    marginTop: 4,
  },
  rightSection: {
    alignItems: "flex-end",
    flexShrink: 0, // NEVER shrink → always visible
  },
});
