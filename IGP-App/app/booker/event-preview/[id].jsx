import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../../src/context/ThemeContext";

/* ===================== HOOKS ===================== */
import { useGigByIdQuery } from "../../../src/hooks/queries/useGigs";
import { useCreateBookingMutation } from "../../../src/hooks/mutations/useBookingMutations";
import { useCloseGigMutation } from "../../../src/hooks/mutations/useGigMutation";

export default function BookerEventPreview() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();

  const [showMenu, setShowMenu] = useState(false);
  const [hiringPerformerId, setHiringPerformerId] = useState(null);

  /* ================= FETCH EVENT ================= */
  const { data: gigResp, isLoading } = useGigByIdQuery(id);
  const event = gigResp?.data;

  /* ================= BOOKING ================= */
  const { mutate: createBooking } = useCreateBookingMutation();

  const { mutate: closeGig } = useCloseGigMutation(id);

  if (isLoading || !event) return null;

  const applicants = event.applicants || [];

  const handleHire = (applicant) => {
    setHiringPerformerId(applicant.performer._id);

    createBooking(
      {
        performerId: applicant.performer._id,
        gigId: event._id,
        eventDate: event.eventDate,
        totalPrice: event.budget,
        source: "applicant",
      },
      {
        onSettled: () => {
          setHiringPerformerId(null);
        },
      }
    );
  };

  const handleClose = () => {
    closeGig();
    setShowMenu(false);
    router.replace("/(tabs)/profile");
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
    >
      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Event Preview
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* ================= BANNER ================= */}
        <Image source={{ uri: event.previewImage }} style={styles.banner} />

        {/* ================= TITLE ================= */}
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {event.title}
        </Text>

        {/* ================= CATEGORY ================= */}
        <View style={[styles.badge, { backgroundColor: theme.colors.card }]}>
          <Text style={{ color: theme.colors.primary, fontWeight: "700" }}>
            {event.categoryRequired}
          </Text>
        </View>

        {/* ================= LOCATION ================= */}
        <View style={styles.infoRow}>
          <Ionicons
            name="location-outline"
            size={18}
            color={theme.colors.primary}
          />
          <Text
            style={[styles.infoText, { color: theme.colors.textSecondary }]}
          >
            {event.location?.address}
          </Text>
        </View>

        {/* ================= DATE ================= */}
        <View style={styles.infoRow}>
          <Ionicons
            name="calendar-outline"
            size={18}
            color={theme.colors.primary}
          />
          <Text
            style={[styles.infoText, { color: theme.colors.textSecondary }]}
          >
            {new Date(event.eventDate.start).toLocaleDateString()} •{" "}
            {new Date(event.eventDate.start).getHours()}:00
          </Text>
        </View>

        {/* ================= DESCRIPTION ================= */}
        <Text style={[styles.section, { color: theme.colors.text }]}>
          Description
        </Text>
        <Text
          style={[styles.description, { color: theme.colors.textSecondary }]}
        >
          {event.description}
        </Text>

        {/* ================= BUDGET ================= */}
        <View style={[styles.priceBox, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.priceLabel, { color: theme.colors.primary }]}>
            Budget
          </Text>
          <Text style={[styles.price, { color: theme.colors.primary }]}>
            ₹{event.budget}
          </Text>
        </View>

        {/* ================= NOTE ================= */}
        <View style={[styles.noteBox, { backgroundColor: theme.colors.card }]}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={theme.colors.primary}
          />
          <Text
            style={[styles.noteText, { color: theme.colors.textSecondary }]}
          >
            This is your event preview. Performers will see this without
            internal details.
          </Text>
        </View>

        {/* ================= APPLICANTS ================= */}
        <Text
          style={[styles.section, { marginTop: 28, color: theme.colors.text }]}
        >
          Applicants List
        </Text>

        {applicants.length === 0 ? (
          <Text style={{ color: theme.colors.textSecondary }}>
            No applications yet
          </Text>
        ) : (
          applicants.map((a) => (
            <View
              key={a.performer._id}
              style={[
                styles.performerCard,
                { backgroundColor: theme.colors.card },
              ]}
            >
              <View>
                <Text
                  style={[styles.performerName, { color: theme.colors.text }]}
                >
                  {a.performer.name}
                </Text>
                <Text style={{ color: theme.colors.textSecondary }}>
                  {a.performer.city}
                </Text>
              </View>

              <TouchableOpacity
                disabled={hiringPerformerId === a.performer._id}
                onPress={() => handleHire(a)}
                style={[
                  styles.hireBtn,
                  {
                    backgroundColor:
                      hiringPerformerId === a.performer._id
                        ? theme.colors.border
                        : theme.colors.primary,
                  },
                ]}
              >
                {hiringPerformerId === a.performer._id ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.hireText}>Hire</Text>
                )}
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* ================= FLOATING OPTIONS ================= */}
      <TouchableOpacity
        onPress={() => setShowMenu(true)}
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
      >
        <Ionicons name="options-outline" size={26} color="#fff" />
      </TouchableOpacity>

      {/* ================= OPTIONS MODAL ================= */}
      <Modal visible={showMenu} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View
            style={[styles.modalCard, { backgroundColor: theme.colors.card }]}
          >
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => {
                setShowMenu(false);
                router.push(`/booker/edit-event/${event._id}`);
              }}
            >
              <Text style={[styles.modalText, { color: theme.colors.text }]}>
                Edit Event
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalBtn} onPress={handleClose}>
              <Text style={[styles.modalText, { color: "#D32F2F" }]}>
                Cancel Event
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowMenu(false)}>
              <Text
                style={{ color: theme.colors.textSecondary, marginTop: 14 }}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ================= STYLES (UNCHANGED DESIGN) ================= */

const styles = StyleSheet.create({
  safe: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    justifyContent: "space-between",
  },

  headerTitle: { fontSize: 18, fontWeight: "700" },

  container: { padding: 20, paddingBottom: 120 },

  banner: { width: "100%", height: 220, borderRadius: 16, marginBottom: 16 },

  title: { fontSize: 24, fontWeight: "800", marginBottom: 8 },

  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },

  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  infoText: { marginLeft: 8, fontSize: 14 },

  section: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  description: { fontSize: 15, lineHeight: 22 },

  priceBox: { marginTop: 24, padding: 16, borderRadius: 14 },
  priceLabel: { fontSize: 12 },
  price: { fontSize: 22, fontWeight: "800", marginTop: 4 },

  noteBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    padding: 14,
    borderRadius: 12,
  },
  noteText: { marginLeft: 8, fontSize: 13, flex: 1 },

  performerCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  performerName: { fontSize: 16, fontWeight: "700" },

  hireBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10 },
  hireText: { color: "#fff", fontWeight: "700" },

  hiredCard: {
    padding: 16,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  hiredName: { fontSize: 17, fontWeight: "800" },

  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    padding: 16,
    borderRadius: 50,
  },

  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCard: {
    width: "80%",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
  },

  modalBtn: {
    paddingVertical: 14,
    width: "100%",
    alignItems: "center",
  },

  modalText: { fontSize: 16, fontWeight: "700" },
});
