import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../../../context/ThemeContext";

/* ===================== HOOKS ===================== */
import { useMyBookingsQuery } from "../../../hooks/queries/useBookings";

/* ===================== COMPONENTS ===================== */
import BookerBookingItem from "../../profile/BookerBookingItem";

export default function BookerBookingScreen({
  visible = false,
  onClose = () => {},
}) {
  const { theme } = useTheme();
  const router = useRouter();

  const [tab, setTab] = useState("current");

  /* ===================== DATA ===================== */
  const { data } = useMyBookingsQuery(visible);
  const bookings = data?.data || [];

  /* ===================== FILTERS ===================== */
  const current = bookings.filter((b) =>
    ["pending", "confirmed"].includes(b.status)
  );

  const past = bookings.filter((b) =>
    ["completed", "cancelled", "declined"].includes(b.status)
  );

  return (
    <Modal visible={visible} animationType="slide">
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        {/* ================= HEADER ================= */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
          </TouchableOpacity>

          <Text style={[styles.title, { color: theme.colors.text }]}>
            Bookings
          </Text>

          <View style={{ width: 24 }} />
        </View>

        {/* ================= TABS ================= */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[
              styles.tabBtn,
              tab === "current" && { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => setTab("current")}
          >
            <Text
              style={[styles.tabText, tab === "current" && { color: "#fff" }]}
            >
              Current Events
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabBtn,
              tab === "past" && { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => setTab("past")}
          >
            <Text style={[styles.tabText, tab === "past" && { color: "#fff" }]}>
              Past Events
            </Text>
          </TouchableOpacity>
        </View>

        {/* ================= LIST ================= */}
        <FlatList
          data={tab === "current" ? current : past}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <BookerBookingItem
              booking={item}
              onPress={() => router.push(`/booking-details/${item._id}`)}
            />
          )}
          ListEmptyComponent={
            <Text
              style={{
                textAlign: "center",
                color: theme.colors.textSecondary,
                marginTop: 20,
              }}
            >
              No bookings found
            </Text>
          }
        />
      </View>
    </Modal>
  );
}

/* ===================== STYLES ===================== */
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 18,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 18, fontWeight: "700" },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 16,
  },
  tabBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: "#F0F0F0",
  },
  tabText: {
    fontWeight: "700",
  },
});
