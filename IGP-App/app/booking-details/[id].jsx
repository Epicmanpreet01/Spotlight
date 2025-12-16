// app/booking-details/[id].jsx
import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import api from "../../src/api/api";
import { useTheme } from "../../src/context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BookingDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();

  // ✅ HOOK MUST BE HERE (before returns)
  const otp = useMemo(() => {
    if (!id) return "000000";

    // create stable 6-digit OTP from booking id
    const numeric = id.replace(/\D/g, "");
    return (numeric + "000000").slice(-6);
  }, [id]);

  const { data, isLoading } = useQuery({
    queryKey: ["booking-details", id],
    queryFn: async () => (await api.get(`/booking/details/${id}`)).data,
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text>Loading booking...</Text>
      </View>
    );
  }

  const booking = data?.data;
  if (!booking) {
    return (
      <View style={styles.center}>
        <Text>Booking not found</Text>
      </View>
    );
  }

  const isPast = ["completed", "cancelled", "declined"].includes(
    booking.status
  );

  const statusColor =
    booking.status === "confirmed"
      ? "#2E7D32"
      : booking.status === "pending"
      ? "#FF9800"
      : "#D32F2F";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Booking Details
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* EVENT CARD */}
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.eventTitle, { color: theme.colors.text }]}>
            {booking.event.title}
          </Text>

          <View style={styles.metaRow}>
            <Ionicons
              name="location-outline"
              size={18}
              color={theme.colors.primary}
            />
            <Text
              style={[styles.metaText, { color: theme.colors.textSecondary }]}
            >
              {booking.event.location}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Ionicons
              name="calendar-outline"
              size={18}
              color={theme.colors.primary}
            />
            <Text
              style={[styles.metaText, { color: theme.colors.textSecondary }]}
            >
              {booking.event.dateTime}
            </Text>
          </View>
        </View>

        {/* DESCRIPTION */}
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Description
          </Text>
          <Text
            style={[styles.bodyText, { color: theme.colors.textSecondary }]}
          >
            {booking.event.description}
          </Text>
        </View>

        {/* ASSIGNED PERFORMER */}
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Assigned Performer
          </Text>

          <Text style={{ color: theme.colors.textSecondary }}>
            {booking.performer.name} • {booking.performer.category}
          </Text>
        </View>

        {/* ✅ EVENT COMPLETION OTP (Booker Side) */}
        {/* ✅ EVENT COMPLETION OTP (Booker Side) */}
        {!isPast && (
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Event Completion OTP
            </Text>

            <View style={styles.otpBox}>
              <Text style={styles.otpText}>{otp}</Text>
            </View>

            <Text style={styles.otpHint}>
              ❗ Share this OTP with the performer after the event is completed.
            </Text>
          </View>
        )}

        {/* STATUS */}
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Status
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>
              {booking.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* PRICE */}
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Price
          </Text>
          <Text style={[styles.price, { color: theme.colors.primary }]}>
            ₹{booking.price}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 18, fontWeight: "700" },

  container: { padding: 16, paddingBottom: 40 },

  card: { borderRadius: 14, padding: 16, marginBottom: 16 },

  eventTitle: { fontSize: 22, fontWeight: "800", marginBottom: 10 },

  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  metaText: { marginLeft: 8 },

  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 6 },

  bodyText: { lineHeight: 20 },

  otpBox: {
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
  },
  otpText: { fontSize: 26, fontWeight: "800", letterSpacing: 4 },

  otpHint: { marginTop: 8, fontSize: 12, color: "#777" },

  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 6,
  },
  statusText: { color: "#fff", fontWeight: "700", fontSize: 12 },

  price: { fontSize: 22, fontWeight: "800" },
});
