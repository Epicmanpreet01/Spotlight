import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ScrollView,
  RefreshControl,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../../src/context/ThemeContext";

/* ===================== HOOKS ===================== */
import { useCurrentUser } from "../../src/hooks/queries/useAuth";
import { useGigsQuery } from "../../src/hooks/queries/useGigs";
import { usePerformersQuery } from "../../src/hooks/queries/usePerformers";
import { useNotifications } from "../../src/hooks/queries/useNotifications";
import { useUpdateLocationMutation } from "../../src/hooks/mutations/useUpdateLocationMutation";

/* ===================== COMPONENTS ===================== */
import {
  NearbyGigsList,
  RecommendedGigsList,
  HomeEmptyState,
} from "../../src/components/home";
import LocationModal from "../../src/components/home/LocationModal";
import PerformerHomeHeader from "../../src/components/home/PerformerHomeHeader";

import BookerHomeHeader from "../../src/components/booker/home/BookerHomeHeader";
import BookerNearbyList from "../../src/components/booker/home/BookerNearbyList";
import BookerRecommendedList from "../../src/components/booker/home/BookerRecommendedList";
import BookerLocationModal from "../../src/components/booker/home/BookerLocationModal";

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const [isLocationModalOpen, setLocationModalOpen] = useState(false);

  /* ===================== USER ===================== */
  const { data: userResp, isLoading: isAuthLoading } = useCurrentUser();
  const user = userResp?.data ?? null;
  const profile = userResp?.profile ?? null;
  const role = user?.role ?? null;
  const performerCategory = role === "performer" ? profile?.category : null;

  /* ===================== NOTIFICATIONS ===================== */
  const { data: notifications = [] } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;

  /* ===================== GIGS (PERFORMER) ===================== */
  const {
    data: gigsResp,
    isLoading: gigsLoading,
    refetch: refetchGigs,
  } = useGigsQuery({}, role === "performer");

  const { data: recommendedGigsResp } = useGigsQuery(
    { requiredCategory: performerCategory },
    role === "performer" && !!performerCategory
  );

  const gigs = gigsResp?.data || [];
  const recommendedGigs = recommendedGigsResp?.data || [];
  const nearbyGigs = gigs.slice(0, 7);

  /* ===================== PERFORMERS (BOOKER) ===================== */
  const {
    data: performersResp,
    isLoading: perfLoading,
    refetch: refetchPerformers,
  } = usePerformersQuery({}, role === "booker");

  const performers = performersResp?.data || [];
  const nearbyPerformers = performers.slice(0, 4);
  const recommendedPerformers = performers.slice(4);

  /* ===================== LOCATION UPDATE ===================== */
  const { mutate: updateLocation } = useUpdateLocationMutation();

  /* ===================== AUTH GUARD ===================== */
  if (isAuthLoading || !role) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  /* ===================== PERFORMER ===================== */
  if (role === "performer") {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={gigsLoading} onRefresh={refetchGigs} />
          }
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <PerformerHomeHeader
            user={user}
            unreadCount={unreadCount}
            onPressNotifications={() => router.push("/notifications")}
            onPressLocation={() => setLocationModalOpen(true)}
          />

          {/* NEARBY GIGS */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Nearby Gigs
            </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/search")}>
              <Text style={[styles.seeAll, { color: theme.colors.primary }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>

          {gigs.length === 0 ? (
            <HomeEmptyState message="No nearby gigs available right now." />
          ) : (
            <NearbyGigsList items={nearbyGigs} />
          )}

          {/* RECOMMENDED */}
          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Recommended
            </Text>
          </View>

          {recommendedGigs.length === 0 ? (
            <HomeEmptyState message="No recommended gigs for your category yet." />
          ) : (
            <RecommendedGigsList items={recommendedGigs} />
          )}
        </ScrollView>

        <LocationModal
          visible={isLocationModalOpen}
          initialCity={user.city || ""}
          onClose={() => setLocationModalOpen(false)}
          onSave={({ city, location }) => {
            updateLocation({ city, location });
            setLocationModalOpen(false);
          }}
        />
      </SafeAreaView>
    );
  }

  /* ===================== BOOKER ===================== */
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={perfLoading}
            onRefresh={refetchPerformers}
          />
        }
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <BookerHomeHeader
          user={user}
          unreadCount={unreadCount}
          onPressNotifications={() => router.push("/notifications")}
          onPressLocation={() => setLocationModalOpen(true)}
        />

        {/* NEARBY PERFORMERS */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Nearby Performers
          </Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/search")}>
            <Text style={[styles.seeAll, { color: theme.colors.primary }]}>
              See All
            </Text>
          </TouchableOpacity>
        </View>

        <BookerNearbyList performers={nearbyPerformers} />

        {/* RECOMMENDED */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Recommended
          </Text>
        </View>

        <BookerRecommendedList performers={recommendedPerformers} />
      </ScrollView>

      <TouchableOpacity
        style={styles.createBtn}
        activeOpacity={0.85}
        onPress={() => router.push("/booker/create-event")}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      <BookerLocationModal
        visible={isLocationModalOpen}
        initialCity={user.city || ""}
        onClose={() => setLocationModalOpen(false)}
        onSave={({ city, location }) => {
          updateLocation({ city, location });
          setLocationModalOpen(false);
        }}
      />
    </SafeAreaView>
  );
}

/* ===================== STYLES ===================== */
const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 6,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  seeAll: { fontSize: 14, fontWeight: "600" },
  createBtn: {
    position: "absolute",
    bottom: 28,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#00BCD4",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
});
