import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { useRouter } from "expo-router";

export default function BookingHistoryItem({ booking }) {
  const { theme } = useTheme();
  const router = useRouter();

  /* ===================== SAFE DERIVED VALUES ===================== */
  const status = booking?.status || "pending";

  const statusColor =
    status === "confirmed"
      ? "#2E7D32"
      : status === "pending"
      ? "#FF9800"
      : "#1976D2";

  const gigId = booking?.gig?._id;
  const title = booking?.gig?.title || "Event";
  const address = booking?.gig?.location?.address || "Location not specified";

  const dateText = booking?.eventDate?.start
    ? new Date(booking.eventDate.start).toLocaleDateString()
    : "Date not set";

  const price = booking?.totalPrice ?? 0;

  /* ===================== HANDLERS ===================== */
  const handlePress = () => {
    if (!gigId) return; // safety guard
    router.push({
      pathname: "/gig/[id]",
      params: { id: gigId },
    });
  };

  /* ===================== RENDER ===================== */
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.card, { borderColor: theme.colors.border }]}
      onPress={handlePress}
    >
      <View>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {title}
        </Text>

        <Text style={{ color: theme.colors.textSecondary, marginTop: 4 }}>
          {dateText} • {address}
        </Text>
      </View>

      <View style={{ alignItems: "flex-end" }}>
        <Text style={{ color: statusColor, fontWeight: "800" }}>
          {status.toUpperCase()}
        </Text>

        <Text style={{ marginTop: 6, fontWeight: "700", color: "#FF6F00" }}>
          ₹{price}
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
    marginBottom: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
});
