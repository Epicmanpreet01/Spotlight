// app/gig-details/[id].jsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../src/context/ThemeContext";
import api from "../../src/api/api";

export default function GigDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();

  const { data, isLoading } = useQuery({
    queryKey: ["gig", id],
    queryFn: async () => (await api.get(`/gigs/${id}`)).data,
    retry: false,
  });

  if (isLoading || !data)
    return (
      <View
        style={[styles.loading, { backgroundColor: theme.colors.background }]}
      >
        <Text style={{ color: theme.colors.text }}>Loading...</Text>
      </View>
    );

  const gig = data.data;

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Image source={{ uri: gig.image }} style={styles.banner} />
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { backgroundColor: theme.colors.card },
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {gig.title}
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{gig.categoryRequired}</Text>
          </View>
        </View>

        <View style={styles.organizerRow}>
          <View
            style={[
              styles.avatarPlaceholder,
              { backgroundColor: theme.colors.inputBg },
            ]}
          >
            <Text style={styles.avatarText}>
              {gig.postedBy.name?.charAt(0)}
            </Text>
          </View>
          <View>
            <Text style={[styles.orgName, { color: theme.colors.text }]}>
              {gig.postedBy.name}
            </Text>
            <Text
              style={[styles.orgLabel, { color: theme.colors.textSecondary }]}
            >
              Organizer
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: theme.colors.inputBg,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.infoRow}>
            <Ionicons name="location" size={22} color={theme.colors.primary} />
            <View style={styles.infoTextContainer}>
              <Text
                style={[
                  styles.infoLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Location
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {gig.location.address}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="time" size={22} color={theme.colors.primary} />
            <View style={styles.infoTextContainer}>
              <Text
                style={[
                  styles.infoLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Time
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {new Date(gig.eventDate.start).toLocaleDateString()} •{" "}
                {new Date(gig.eventDate.start).getHours()}:00
              </Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Description
        </Text>
        <Text
          style={[styles.description, { color: theme.colors.textSecondary }]}
        >
          {gig.description}
        </Text>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: theme.colors.card,
            borderTopColor: theme.colors.border,
          },
        ]}
      >
        <View>
          <Text
            style={[styles.footerLabel, { color: theme.colors.textSecondary }]}
          >
            Budget
          </Text>
          <Text style={[styles.price, { color: "green" }]}>
            ₹{Number(gig.budget).toLocaleString()}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.applyBtn, { backgroundColor: theme.colors.primary }]}
          onPress={() =>
            Alert.alert("Applied!", "Organizer will contact you soon.")
          }
        >
          <Text style={styles.applyBtnText}>Apply Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  banner: { width: "100%", height: 300, position: "absolute" },
  overlay: {
    width: "100%",
    height: 300,
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  safeArea: { marginHorizontal: 20 },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    marginTop: 220,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    paddingBottom: 120,
    minHeight: 600,
  },
  header: { marginBottom: 20 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 8 },
  badge: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  badgeText: { color: "#FF5722", fontWeight: "bold", fontSize: 12 },
  organizerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarText: { color: "#FFF", fontWeight: "bold" },
  orgName: { fontSize: 15, fontWeight: "bold" },
  orgLabel: { fontSize: 12 },
  infoCard: { borderRadius: 16, padding: 15, marginBottom: 25, borderWidth: 1 },
  infoRow: { flexDirection: "row", alignItems: "center" },
  infoTextContainer: { marginLeft: 15 },
  infoLabel: { fontSize: 12 },
  infoValue: { fontSize: 14, fontWeight: "600", marginTop: 2 },
  divider: { height: 1, backgroundColor: "#EEE", marginVertical: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  description: { fontSize: 15, lineHeight: 22, marginBottom: 20 },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLabel: { fontSize: 12 },
  price: { fontSize: 22, fontWeight: "bold" },
  applyBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },
  applyBtnText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});
