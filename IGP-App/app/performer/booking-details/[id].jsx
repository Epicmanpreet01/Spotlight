// app/performer/booking-details/[id].jsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import api from "../../../src/api/api";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../../src/context/ThemeContext";

export default function PerformerBookingDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();

  const [otp, setOtp] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["booking-details-performer", id],
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
  if (!booking)
    return (
      <View style={styles.center}>
        <Text>Booking not found</Text>
      </View>
    );

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
        <View
          style={[
            styles.card,
            styles.eventCard,
            { backgroundColor: theme.colors.card },
          ]}
        >
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

        {/* ROLE */}
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Performer Role
          </Text>
          <Text
            style={[styles.bodyText, { color: theme.colors.textSecondary }]}
          >
            {booking.role}
          </Text>
        </View>

        {/* ====================== OTP SECTION FOR CURRENT BOOKINGS ====================== */}
        {!isPast && (
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

            <Text
              style={{
                color: theme.colors.textSecondary,
                marginTop: 8,
                fontSize: 12,
              }}
            >
              ❗ Enter this OTP after the event is completed to mark it
              finished.
            </Text>

            <TouchableOpacity
              disabled={otp.length !== 6}
              style={[
                styles.otpBtn,
                {
                  backgroundColor:
                    otp.length === 6
                      ? theme.colors.primary
                      : theme.colors.border,
                },
              ]}
            >
              <Text style={styles.otpBtnText}>Submit OTP</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ====================== PAST BOOKINGS: NO Assigned Performer ====================== */}
        {isPast && (
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Event Completed
            </Text>
            <Text
              style={[styles.bodyText, { color: theme.colors.textSecondary }]}
            >
              This booking has been completed successfully.
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

        {/* PRICE – No payment button for Performer */}
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
});
