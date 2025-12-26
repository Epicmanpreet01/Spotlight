import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../context/ThemeContext";
import { useRouter } from "expo-router";

/* ===================== COMPONENTS ===================== */
import BookerBookingScreen from "./BookerBookingScreen";
import BookerEventPreviewCard from "../events/BookerEventPreviewCard";

export default function BookerActionsPanel({ gigs = [], bookings = [] }) {
  const { theme } = useTheme();
  const router = useRouter();

  const [showBookings, setShowBookings] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);

  /* ===================== CURRENT EVENTS ===================== */
  const currentEvents = useMemo(() => {
    const now = new Date();
    return gigs.filter(
      (g) =>
        g?.eventDate?.start &&
        new Date(g.eventDate.start) >= now &&
        g.status !== "closed"
    );
  }, [gigs]);

  return (
    <>
      {/* ===== ACTION BUTTONS ===== */}
      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: theme.colors.primary }]}
        onPress={() => setShowBookings(true)}
      >
        <Text style={styles.actionText}>Bookings</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: theme.colors.primary }]}
        onPress={() => setShowCurrent(true)}
      >
        <Text style={styles.actionText}>Current Performers / Events</Text>
      </TouchableOpacity>

      <View style={{ height: 22 }} />

      {/* ================= BOOKINGS SCREEN ================= */}
      <BookerBookingScreen
        visible={showBookings}
        onClose={() => setShowBookings(false)}
        bookings={bookings}
      />

      {/* ================= CURRENT EVENTS MODAL ================= */}
      <Modal visible={showCurrent} animationType="slide">
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <Header
            title="Current Performers / Events"
            onClose={() => setShowCurrent(false)}
            theme={theme}
          />

          <FlatList
            data={currentEvents}
            keyExtractor={(i) => i._id}
            contentContainerStyle={{ padding: 20 }}
            renderItem={({ item }) => (
              <BookerEventPreviewCard
                event={item}
                onPress={() =>
                  router.push({
                    pathname: "/booker/event-preview/[id]",
                    params: { id: item._id },
                  })
                }
              />
            )}
            ListEmptyComponent={
              <Text
                style={{
                  textAlign: "center",
                  color: theme.colors.textSecondary,
                  marginTop: 40,
                }}
              >
                No current events
              </Text>
            }
          />
        </View>
      </Modal>
    </>
  );
}

/* ================= HEADER ================= */
function Header({ title, onClose, theme }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onClose}>
        <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
      </TouchableOpacity>

      <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
        {title}
      </Text>

      <View style={{ width: 24 }} />
    </View>
  );
}

/* ================= STYLES (UNCHANGED) ================= */
const styles = StyleSheet.create({
  actionBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  actionText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  modalContainer: { flex: 1 },
  header: {
    paddingTop: 18,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
});
