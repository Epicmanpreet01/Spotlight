import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../src/context/ThemeContext";

/* 🔗 Hooks */
import { useBookingById } from "../../src/hooks/queries/useBookings";
import { useCurrentUser } from "../../src/hooks/queries/useAuth"; // ✅ ADD
import {
  useConfirmBookingMutation,
  useCancelBookingMutation,
} from "../../src/hooks/mutations/useBookingMutations";

export default function BookingDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();

  const { data, isLoading } = useBookingById(id);
  const booking = data?.data;

  const { data: currentUser } = useCurrentUser(); // ✅ ADD

  const { mutate: confirmBooking, isPending: confirming } =
    useConfirmBookingMutation(id);

  const { mutate: cancelBooking, isPending: cancelling } =
    useCancelBookingMutation(id);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text style={{ color: theme.colors.text }}>Loading booking...</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.center}>
        <Text style={{ color: theme.colors.text }}>Booking not found</Text>
      </View>
    );
  }

  const isPast = ["completed", "cancelled", "declined"].includes(
    booking.status
  );

  // ✅ CORRECT BOOKER CHECK
  const isBooker = booking.booker?._id === currentUser?.data?._id;

  // ✅ CANCEL RULE (matches backend)
  const canCancel =
    isBooker && ["pending", "accepted"].includes(booking.status);

  const statusColor =
    booking.status === "confirmed"
      ? "#2E7D32"
      : booking.status === "pending"
      ? "#FF9800"
      : "#D32F2F";

  const handleCancel = () => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => cancelBooking(),
        },
      ]
    );
  };

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
            {booking.gig?.title}
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
              {booking.gig?.location?.address}
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
              {new Date(booking.eventDate.start).toDateString()} –{" "}
              {new Date(booking.eventDate.end).toDateString()}
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
            {booking.gig?.description}
          </Text>
        </View>

        {/* ASSIGNED PERFORMER */}
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Assigned Performer
          </Text>

          <Text style={{ color: theme.colors.textSecondary }}>
            {booking.performer?.name}
          </Text>
        </View>

        {/* CONFIRM BOOKING */}
        {booking.status === "accepted" && isBooker && (
          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => confirmBooking()}
            disabled={confirming}
          >
            <Text style={styles.actionText}>
              {confirming ? "Confirming..." : "Confirm Booking"}
            </Text>
          </TouchableOpacity>
        )}

        {/* ✅ CANCEL BOOKING (NOW WORKS) */}
        {canCancel && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#D32F2F" }]}
            onPress={handleCancel}
            disabled={cancelling}
          >
            <Text style={styles.actionText}>
              {cancelling ? "Cancelling..." : "Cancel Booking"}
            </Text>
          </TouchableOpacity>
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
            ₹{booking.totalPrice}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ===================== STYLES (UNCHANGED) ===================== */
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

  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 6,
  },
  statusText: { color: "#fff", fontWeight: "700", fontSize: 12 },

  price: { fontSize: 22, fontWeight: "800" },

  actionBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  actionText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
