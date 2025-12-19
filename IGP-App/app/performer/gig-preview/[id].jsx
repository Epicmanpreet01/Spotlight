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
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../../src/context/ThemeContext";

/* 🔗 Hooks */
import { useGigByIdQuery } from "../../../src/hooks/queries/useGigs";
import {
  useApplyToGigMutation,
  useWithdrawFromGigMutation,
} from "../../../src/hooks/mutations/useGigMutation";

export default function PerformerGigPreview() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();

  /* ===================== FETCH GIG ===================== */
  const { data, isLoading } = useGigByIdQuery(id);
  const gig = data?.data;

  /* ===================== MUTATIONS ===================== */
  const { mutate: applyToGig, isPending: applying } = useApplyToGigMutation(id);

  const { mutate: withdrawGig, isPending: withdrawing } =
    useWithdrawFromGigMutation(id);

  if (isLoading || !gig) return null;

  const eventStart = new Date(gig.eventDate.start);
  const eventEnd = new Date(gig.eventDate.end);

  const hasApplied = gig.hasApplied;

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
        <Image source={{ uri: gig.previewImage }} style={styles.banner} />

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
              {gig.location.address}
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
              {eventStart.toDateString()} – {eventEnd.toDateString()}
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
        {hasApplied && (
          <TouchableOpacity
            style={styles.rejectBtn}
            onPress={() => withdrawGig()}
            disabled={withdrawing}
          >
            <Text style={styles.actionText}>
              {withdrawing ? "Withdrawing..." : "Withdraw"}
            </Text>
          </TouchableOpacity>
        )}
        {!hasApplied && (
          <TouchableOpacity
            style={[
              styles.acceptBtn,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => applyToGig({})}
            disabled={applying}
          >
            <Text style={styles.actionText}>
              {applying ? "Applying..." : "Accept"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

/* ===================== STYLES (UNCHANGED) ===================== */
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
