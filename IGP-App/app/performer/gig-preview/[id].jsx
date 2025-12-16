// app/performer/gig-preview/[id].jsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../../src/api/api";
import { useTheme } from "../../../src/context/ThemeContext";

export default function PerformerGigPreview() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { theme } = useTheme();

  const { data } = useQuery({
    queryKey: ["gig-preview", id],
    queryFn: async () => (await api.get("/booker/events")).data,
  });

  const gig = data?.data?.find((e) => e._id === id);
  if (!gig) return null;

  const handleAccept = async () => {
    await api.post("/booking/create", { gigId: gig._id });
    queryClient.invalidateQueries(["performerBookings"]);
    router.back();
  };

  const handleReject = async () => {
    await api.post("/booking/reject", { gigId: gig._id });
    router.back();
  };

  const eventDate = new Date(gig.eventDate.start);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Gig Preview
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* IMAGE */}
        <Image source={{ uri: gig.image }} style={styles.banner} />

        {/* TITLE */}
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {gig.title}
        </Text>

        {/* META INFO */}
        <View style={styles.metaBlock}>
          <View style={styles.metaRow}>
            <Ionicons
              name="location-outline"
              size={18}
              color={theme.colors.primary}
            />
            <Text
              style={[styles.metaText, { color: theme.colors.textSecondary }]}
            >
              {gig.location.address}, {gig.location.city}
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
              {eventDate.toLocaleDateString()} •{" "}
              {eventDate.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        </View>

        {/* DESCRIPTION */}
        <Text style={[styles.section, { color: theme.colors.text }]}>
          Description
        </Text>
        <Text
          style={[styles.description, { color: theme.colors.textSecondary }]}
        >
          {gig.description}
        </Text>

        {/* PRICE */}
        <View style={[styles.priceBox, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.priceLabel, { color: theme.colors.primary }]}>
            Offered Budget
          </Text>
          <Text style={[styles.price, { color: theme.colors.primary }]}>
            ₹{gig.budget}
          </Text>
        </View>
      </ScrollView>

      {/* ACTION BUTTONS */}
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.rejectBtn]} onPress={handleReject}>
          <Text style={styles.actionText}>Reject</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.acceptBtn, { backgroundColor: theme.colors.primary }]}
          onPress={handleAccept}
        >
          <Text style={styles.actionText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  container: {
    padding: 20,
    paddingBottom: 140,
  },

  banner: {
    height: 220,
    borderRadius: 18,
    marginBottom: 18,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 12,
  },

  metaBlock: {
    marginBottom: 18,
    gap: 10,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  metaText: {
    fontSize: 14,
  },

  section: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },

  description: {
    fontSize: 15,
    lineHeight: 22,
  },

  priceBox: {
    marginTop: 24,
    padding: 16,
    borderRadius: 14,
  },

  priceLabel: {
    fontSize: 12,
  },

  price: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: 4,
  },

  actions: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    flexDirection: "row",
    gap: 12,
  },

  acceptBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  rejectBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#D32F2F",
  },

  actionText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
