// src/components/profile/CurrentGigsScreen.jsx
import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Image,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

/* ===================== HOOKS ===================== */
import { useMyBookingsQuery } from "../../hooks/queries/useBookings";

export default function CurrentGigsScreen({ visible, onClose }) {
  const { theme } = useTheme();
  const router = useRouter();

  /* ===================== DATA ===================== */
  const { data: bookingsResp, isLoading } = useMyBookingsQuery(visible);
  const bookings = bookingsResp?.data || [];

  /* ===================== DERIVED: CURRENT GIGS ===================== */
  const currentGigs = useMemo(() => {
    return bookings.filter((b) => ["confirmed", "pending"].includes(b.status));
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
            Current Gigs
          </Text>

          <View style={{ width: 24 }} />
        </View>

        {/* ================= LIST ================= */}
        <FlatList
          data={currentGigs}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          renderItem={({ item }) => {
            const gig = item.gig;

            if (!gig) return null;

            const eventDate = item.eventDate?.start
              ? new Date(item.eventDate.start)
              : null;

            return (
              <TouchableOpacity
                activeOpacity={0.9}
                style={[styles.card, { backgroundColor: theme.colors.card }]}
                onPress={() => router.push(`/performer/gig-preview/${gig._id}`)}
              >
                {/* IMAGE */}
                {gig.previewImage && (
                  <Image
                    source={{ uri: gig.previewImage }}
                    style={styles.banner}
                  />
                )}

                {/* CONTENT */}
                <View style={styles.body}>
                  <Text
                    style={[styles.cardTitle, { color: theme.colors.text }]}
                  >
                    {gig.title}
                  </Text>

                  {/* LOCATION */}
                  <View style={styles.row}>
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color={theme.colors.primary}
                    />
                    <Text
                      style={[
                        styles.meta,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      {gig.location?.address || "Location not specified"}
                    </Text>
                  </View>

                  {/* DATE */}
                  {eventDate && (
                    <View style={styles.row}>
                      <Ionicons
                        name="time-outline"
                        size={16}
                        color={theme.colors.primary}
                      />
                      <Text
                        style={[
                          styles.meta,
                          { color: theme.colors.textSecondary },
                        ]}
                      >
                        {eventDate.toLocaleDateString()} •{" "}
                        {eventDate.getHours()}:00
                      </Text>
                    </View>
                  )}

                  {/* DESCRIPTION */}
                  <Text
                    style={[styles.desc, { color: theme.colors.textSecondary }]}
                    numberOfLines={2}
                  >
                    {gig.description || "No description available"}
                  </Text>

                  {/* BUDGET */}
                  <Text style={styles.budget}>₹{gig.budget}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            !isLoading && (
              <Text
                style={{
                  textAlign: "center",
                  color: theme.colors.textSecondary,
                  marginTop: 40,
                }}
              >
                No current gigs
              </Text>
            )
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

  card: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: "hidden",
  },

  banner: {
    width: "100%",
    height: 180,
  },

  body: {
    padding: 16,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 6,
  },

  meta: {
    fontSize: 13,
  },

  desc: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
  },

  budget: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "800",
    color: "green",
  },
});
