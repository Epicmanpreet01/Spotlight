// app/(tabs)/profile.jsx
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ScrollView,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../src/api/api";
import { useTheme } from "../../src/context/ThemeContext";

import {
  ProfileHeader,
  PortfolioCard,
  BookingHistoryItem,
  CurrentGigsScreen,
  PerformerBookingsScreen,
  SettingsPanel,
} from "../../src/components/profile";

import { BookerActionsPanel } from "../../src/components/booker/profile";

// Booker profile components
import BookerProfileHeader from "../../src/components/booker/profile/BookerProfileHeader";
import BookerSettingsPanel from "../../src/components/booker/profile/BookerSettingsPanel";

export default function ProfileScreen({ navigation }) {
  const { theme } = useTheme();
  const qc = useQueryClient();
  const [showGigs, setShowGigs] = useState(false);
  const [showBookings, setShowBookings] = useState(false);

  const { data: userResp } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        return (await api.get("/auth/me")).data;
      } catch (e) {
        return null;
      }
    },
    retry: false,
  });

  const { data: bookingsResp } = useQuery({
    queryKey: ["myBookings"],
    queryFn: async () => (await api.get("/booking/my-bookings")).data,
    enabled: !!userResp,
    retry: false,
  });

  const user = userResp?.data;
  const bookings = bookingsResp?.data || [];

  const saveProfile = useMutation({
    mutationFn: async (payload) =>
      await api.put("/performers/profile", payload),
    onSuccess: () => qc.invalidateQueries(["currentUser"]),
  });

  const handleLogout = () => {
    try {
      if (api.setAuthToken) api.setAuthToken(null);
    } catch (e) {}
  };

  // If booker -> show booker profile layout (no portfolio)
  // Booker profile
  if (user?.role === "booker") {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <BookerProfileHeader user={user} />

          <View style={{ marginTop: 20 }}>
            <BookerActionsPanel
              onBookings={() => setShowBookings(true)}
              onEvents={() => setShowGigs(true)}
            />
          </View>

          <BookerSettingsPanel onLogout={handleLogout} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Performer profile (unchanged)
  if (!user) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={{ color: theme.colors.text }}>
            Please login to view profile.
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 30 }}>
        <ProfileHeader
          user={user}
          onUpdated={() => qc.invalidateQueries(["currentUser"])}
        />

        <View style={{ height: 12 }} />

        <PortfolioCard
          profile={user.profile || {}}
          onSave={(payload) => saveProfile.mutate(payload)}
        />

        <View style={{ marginTop: 18 }}>
          <TouchableOpacity
            style={styles.optionBtn}
            onPress={() => setShowBookings(true)}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Bookings</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 18 }}>
          <TouchableOpacity
            style={styles.optionBtn}
            onPress={() => setShowGigs(true)}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>
              Current Gigs / Events
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 24 }}>
          <SettingsPanel onLogout={handleLogout} />
        </View>
      </ScrollView>

      {/* Full screen pages (modals) */}
      <CurrentGigsScreen
        visible={showGigs}
        onClose={() => setShowGigs(false)}
      />
      <PerformerBookingsScreen
        visible={showBookings}
        onClose={() => setShowBookings(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  optionBtn: {
    backgroundColor: "#FF5722",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
});
