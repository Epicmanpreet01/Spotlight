// src/components/profile/PerformerBookingsScreen.jsx
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

/* ===================== COMPONENT ===================== */
import BookingItem from "../common/BookingItem";

export default function PerformerBookingsScreen({
  visible = false,
  onClose,
  bookings = [],
}) {
  const { theme } = useTheme();
  const [tab, setTab] = useState("current");
  const router = useRouter();

  /* ===================== DERIVED ===================== */
  const { current, past } = useMemo(() => {
    return {
      current: bookings.filter((b) =>
        ["pending", "confirmed"].includes(b.status)
      ),
      past: bookings.filter((b) =>
        ["completed", "cancelled", "declined"].includes(b.status)
      ),
    };
  }, [bookings]);

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
          {["current", "past"].map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.tabBtn,
                tab === t && { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabText, tab === t && { color: "#fff" }]}>
                {t === "current" ? "Current Events" : "Past Events"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ================= LIST ================= */}
        <FlatList
          data={tab === "current" ? current : past}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <BookingItem
              booking={item}
              role={item.performer === item.booker ? "booker" : "performer"}
              onPress={() =>
                router.push({
                  pathname: "/performer/booking-details/[id]",
                  params: { id: item._id },
                })
              }
            />
          )}
          ListEmptyComponent={
            <Text
              style={{
                textAlign: "center",
                marginTop: 24,
                color: theme.colors.textSecondary,
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

/* ===================== STYLES (UNCHANGED) ===================== */
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 18, fontWeight: "700" },
  tabs: { flexDirection: "row", paddingHorizontal: 16 },
  tabBtn: {
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: "#eee",
  },
  tabText: { fontWeight: "700" },
});
