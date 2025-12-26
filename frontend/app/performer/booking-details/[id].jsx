// app/performer/booking-details/[id].jsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../../src/context/ThemeContext";

/* 🔗 Hooks */
import { useBookingById } from "../../../src/hooks/queries/useBookings";
import {
  useAcceptBookingMutation,
  useDeclineBookingMutation,
  useCompleteBookingMutation,
  useCancelBookingMutation,
} from "../../../src/hooks/mutations/useBookingMutations";

export default function PerformerBookingDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();

  const [otp, setOtp] = useState("");

  /* ===================== DATA ===================== */
  const { data, isLoading } = useBookingById(id);
  const booking = data?.data;

  /* ===================== MUTATIONS ===================== */
  const { mutate: acceptBooking, isPending: accepting } =
    useAcceptBookingMutation(id);

  const { mutate: declineBooking, isPending: declining } =
    useDeclineBookingMutation(id);

  const { mutate: completeBooking, isPending: completing } =
    useCompleteBookingMutation();

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

  const statusColor =
    booking.status === "confirmed"
      ? "#2E7D32"
      : booking.status === "pending"
      ? "#FF9800"
      : "#D32F2F";

  const handleSubmitOtp = () => {
    if (otp.length !== 6) return;

    completeBooking(
      { id: booking._id, body: { code: otp } },
      {
        onSuccess: () => {
          Alert.alert("Success", "Booking marked as completed");
          setOtp("");
        },
      }
    );
  };

  const handleDecline = () => {
    Alert.alert(
      "Decline Booking",
      "Are you sure you want to decline this booking?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Decline",
          style: "destructive",
          onPress: () => declineBooking(),
        },
      ]
    );
  };

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
        <View
          style={[
            styles.card,
            styles.eventCard,
            { backgroundColor: theme.colors.card },
          ]}
        >
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

        {/* ====================== PENDING ACTIONS (NEW) ====================== */}

        {/* ====================== OTP SECTION ====================== */}
        {!isPast && booking.status === "confirmed" && (
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Complete Event (OTP Required)
            </Text>

            <TextInput
              maxLength={6}
              keyboardType="numeric"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChangeText={setOtp}
              placeholderTextColor={theme.colors.textSecondary}
              style={[
                styles.otpInput,
                {
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
            />

            <TouchableOpacity
              disabled={otp.length !== 6 || completing}
              style={[
                styles.otpBtn,
                {
                  backgroundColor:
                    otp.length === 6
                      ? theme.colors.primary
                      : theme.colors.border,
                },
              ]}
              onPress={handleSubmitOtp}
            >
              <Text style={styles.otpBtnText}>
                {completing ? "Submitting..." : "Submit OTP"}
              </Text>
            </TouchableOpacity>
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
            ₹{booking.totalPrice}
          </Text>
        </View>
      </ScrollView>
      {(booking.status === "pending" || booking.status === "accepted") && (
        <View style={styles.bottomActions}>
          {booking.status === "pending" && (
            <>
              <TouchableOpacity
                style={[styles.bottomBtn, { backgroundColor: "#D32F2F" }]}
                onPress={handleDecline}
                disabled={declining}
              >
                <Text style={styles.actionText}>
                  {declining ? "Declining..." : "Decline"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.bottomBtn,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={() => acceptBooking()}
                disabled={accepting}
              >
                <Text style={styles.actionText}>
                  {accepting ? "Accepting..." : "Accept"}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {booking.status === "accepted" && (
            <TouchableOpacity
              style={[styles.bottomBtn, { backgroundColor: "#D32F2F" }]}
              onPress={handleCancel}
              disabled={cancelling}
            >
              <Text style={styles.actionText}>
                {cancelling ? "Cancelling..." : "Cancel Booking"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
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

  container: {
    padding: 16,
    paddingBottom: 40,
  },

  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },

  eventTitle: { fontSize: 22, fontWeight: "800", marginBottom: 10 },

  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },

  metaText: { marginLeft: 8, fontSize: 14 },

  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 6 },

  bodyText: { fontSize: 14, lineHeight: 20 },

  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 6,
  },

  statusText: { color: "#FFF", fontWeight: "700", fontSize: 12 },

  price: { fontSize: 22, fontWeight: "800" },

  actionBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 16,
  },

  actionText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  otpInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 18,
    letterSpacing: 3,
  },

  otpBtn: {
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  otpBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  bottomActions: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    flexDirection: "row",
    gap: 12,
  },

  bottomBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
});
