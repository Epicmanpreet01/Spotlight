// src/components/profile/PerformerBookingItem.jsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../../context/ThemeContext";

export default function PerformerBookingItem({ booking = {}, onPress }) {
  const { theme } = useTheme();

  const status = booking?.status || "pending";

  const statusColor =
    status === "confirmed"
      ? "#2E7D32"
      : status === "pending"
      ? "#FF9800"
      : "#D32F2F";

  const title = booking?.gig?.title || "Event";
  const address = booking?.gig?.location?.address || "Location";
  const date = booking?.eventDate?.start
    ? new Date(booking.eventDate.start).toLocaleDateString()
    : "Date";

  const totalPrice = booking?.totalPrice ?? "--";

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.card, { borderColor: theme.colors.border }]}
      onPress={onPress}
    >
      <View>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {title}
        </Text>

        <Text style={{ color: theme.colors.textSecondary }}>
          {date} • {address}
        </Text>
      </View>

      <View style={{ alignItems: "flex-end" }}>
        <Text style={{ color: statusColor, fontWeight: "700" }}>
          {status.toUpperCase()}
        </Text>

        <Text style={{ marginTop: 6, fontWeight: "700", color: "#FF6F00" }}>
          ₹{totalPrice}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

/* ===================== STYLES (UNCHANGED) ===================== */
const styles = StyleSheet.create({
  card: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
});
