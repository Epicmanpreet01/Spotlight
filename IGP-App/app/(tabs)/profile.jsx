import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ScrollView,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "../../src/context/ThemeContext";
import { useQueryClient } from "@tanstack/react-query";

/* ===================== HOOKS ===================== */
import { useCurrentUser } from "../../src/hooks/queries/useAuth";
import { useMyBookingsQuery } from "../../src/hooks/queries/useBookings";
import { useMyGigsQuery } from "../../src/hooks/queries/useGigs";
import { useUpdatePerformerProfileMutation } from "../../src/hooks/mutations/usePerformerMutation";

/* ===================== COMPONENTS ===================== */
import {
  ProfileHeader,
  PortfolioCard,
  CurrentGigsScreen,
  PerformerBookingsScreen,
  SettingsPanel,
} from "../../src/components/profile";

import { BookerActionsPanel } from "../../src/components/booker/profile";
import BookerProfileHeader from "../../src/components/booker/profile/BookerProfileHeader";
import BookerSettingsPanel from "../../src/components/booker/profile/BookerSettingsPanel";

export default function ProfileScreen() {
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const [showGigs, setShowGigs] = useState(false);
  const [showBookings, setShowBookings] = useState(false);

  /* ===================== USER ===================== */
  const { data: me } = useCurrentUser();
  const user = me?.data;
  const role = user?.role;

  /* ===================== DATA ===================== */
  const { data: bookingsResp } = useMyBookingsQuery(!!user);
  const bookings = bookingsResp?.data || [];

  const { data: gigsResp } = useMyGigsQuery(role === "booker");
  const gigs = gigsResp?.data || [];

  const updateProfile = useUpdatePerformerProfileMutation();

  /* ===================== LOGOUT ===================== */
  const handleLogout = () => {
    queryClient.clear();
    // auth guard / root layout handles redirect
  };

  /* ===================== BOOKER PROFILE ===================== */
  if (role === "booker") {
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

        <CurrentGigsScreen
          visible={showGigs}
          onClose={() => setShowGigs(false)}
          gigs={gigs}
        />

        <PerformerBookingsScreen
          visible={showBookings}
          onClose={() => setShowBookings(false)}
          bookings={bookings}
        />
      </SafeAreaView>
    );
  }

  /* ===================== PERFORMER PROFILE ===================== */
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
          onUpdated={() => queryClient.invalidateQueries(["currentUser"])}
        />

        <View style={{ height: 12 }} />

        <PortfolioCard
          profile={user.profile || {}}
          onSave={(payload) => updateProfile.mutate(payload)}
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
