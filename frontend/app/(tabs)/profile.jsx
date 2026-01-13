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

import { useCurrentUser } from "../../src/hooks/queries/useAuth";
import { useMyBookingsQuery } from "../../src/hooks/queries/useBookings";
import {
  useMyGigsQuery,
  useAppliedGigsQuery,
} from "../../src/hooks/queries/useGigs";
import { useUpdatePerformerProfileMutation } from "../../src/hooks/mutations/usePerformerMutation";

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

  const { data: me } = useCurrentUser();
  const user = me?.data;
  const role = user?.role;
  const profile = me?.profile;

  const { data: bookingsResp } = useMyBookingsQuery(!!user);
  const bookings = bookingsResp?.data || [];

  const { data: myGigsResp } = useMyGigsQuery(role === "booker");
  const { data: appliedGigsResp } = useAppliedGigsQuery(role === "performer");

  const myGigs = myGigsResp || [];
  const appliedGigs = appliedGigsResp || [];

  console.log("Returned GIGS");
  console.log(myGigs);
  console.log(Array.isArray(myGigs), myGigs.length);
  const updateProfile = useUpdatePerformerProfileMutation();

  const handleLogout = () => {
    queryClient.clear();
  };

  if (role === "booker") {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <BookerProfileHeader user={user} />

          <View style={{ marginTop: 20 }}>
            <BookerActionsPanel gigs={myGigs} bookings={bookings} />
          </View>

          <BookerSettingsPanel onLogout={handleLogout} />
        </ScrollView>
      </SafeAreaView>
    );
  }

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
          profile={profile || {}}
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
        gigs={appliedGigs}
      />

      <PerformerBookingsScreen
        visible={showBookings}
        onClose={() => setShowBookings(false)}
        bookings={bookings}
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
