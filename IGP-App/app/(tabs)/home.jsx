import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ScrollView,
  RefreshControl,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../../src/context/ThemeContext";

/* ===================== HOOKS ===================== */
import { useCurrentUser } from "../../src/hooks/queries/useAuth.js";
import { useGigsQuery } from "../../src/hooks/queries/useGigs.js";
import { usePerformersQuery } from "../../src/hooks/queries/usePerformers.js";
import { useQuery } from "@tanstack/react-query";
import api from "../../src/api/api";

/* ===================== COMPONENTS ===================== */
/* Performer */
import {
  NearbyGigsList,
  RecommendedGigsList,
  HomeEmptyState,
} from "../../src/components/home";
import LocationModal from "../../src/components/home/LocationModal";

/* Booker */
import BookerHomeHeader from "../../src/components/booker/home/BookerHomeHeader";
import BookerNearbyList from "../../src/components/booker/home/BookerNearbyList";
import BookerRecommendedList from "../../src/components/booker/home/BookerRecommendedList";

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  /* ===================== CURRENT USER ===================== */
  const { data: userResp } = useCurrentUser();
  const user = userResp?.data;
  const role = user?.role;

  /* ===================== PERFORMER DATA ===================== */
  const {
    data: gigsResp,
    isLoading: gigsLoading,
    refetch: refetchGigs,
  } = useGigsQuery({}, role === "performer");

  const { data: notificationsResp } = useQuery({
    queryKey: ["notifications"],
    enabled: role === "performer",
    queryFn: async () => (await api.get("/notifications")).data,
    refetchInterval: 5000,
  });

  /* ===================== BOOKER DATA ===================== */
  const {
    data: performersResp,
    isLoading: perfLoading,
    refetch: refetchPerformers,
  } = usePerformersQuery({}, role === "booker");

  /* ===================== DERIVED DATA ===================== */
  const gigs = gigsResp?.data || [];
  const performers = performersResp?.data || [];
  const notifications = notificationsResp?.data || [];

  const unreadCount = notifications.filter((n) => !n.read).length;

  const nearbyGigs = gigs.slice(0, 7);
  const recommendedGigs = gigs.slice(7, 12);

  const nearbyPerformers = performers.slice(0, 4);
  const recommendedPerformers = performers.slice(4);

  const [isLocationModalOpen, setLocationModalOpen] = useState(false);

  /* ===================== AUTH GUARD ===================== */
  if (!user) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={{ padding: 20 }}>
          <Text style={{ color: theme.colors.text }}>Please login.</Text>
        </View>
      </SafeAreaView>
    );
  }

  /* ===================== PERFORMER UI ===================== */
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
          {/* HEADER */}
          <View style={[styles.topRow, { paddingHorizontal: 20 }]}>
            <View>
              <Text style={[styles.greeting, { color: theme.colors.text }]}>
                Hello, {user?.name?.split(" ")[0] || "Artist"}!
              </Text>

              <TouchableOpacity
                onPress={() => setLocationModalOpen(true)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 6,
                }}
              >
                <Ionicons
                  name="location-outline"
                  size={14}
                  color={theme.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.locationText,
                    { color: theme.colors.textSecondary, marginLeft: 6 },
                  ]}
                >
                  {user.city || "Set your location"}
                </Text>
                <Ionicons
                  name="pencil"
                  size={14}
                  color={theme.colors.textSecondary}
                  style={{ marginLeft: 6 }}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => router.push("/notifications")}
              style={styles.notifBtn}
            >
              <Ionicons
                name="notifications-outline"
                size={22}
                color={theme.colors.text}
              />
              {unreadCount > 0 && (
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: theme.colors.primary },
                  ]}
                >
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

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
            <HomeEmptyState />
          ) : (
            <NearbyGigsList items={nearbyGigs} />
          )}

          {/* RECOMMENDED */}
          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Recommended
            </Text>
          </View>

          <RecommendedGigsList items={recommendedGigs} />
        </ScrollView>

        <LocationModal
          visible={isLocationModalOpen}
          initialCity={user.city || ""}
          onClose={() => setLocationModalOpen(false)}
          onSave={() => setLocationModalOpen(false)}
        />
      </SafeAreaView>
    );
  }

  /* ===================== BOOKER UI ===================== */
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
        <BookerHomeHeader user={user} />

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

      {/* FLOATING CREATE EVENT */}
      <TouchableOpacity
        style={styles.createBtn}
        activeOpacity={0.85}
        onPress={() => router.push("/booker/create-event")}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

/* ===================== STYLES (UNCHANGED) ===================== */
const styles = StyleSheet.create({
  container: { flex: 1 },
  topRow: {
    paddingTop: 20,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: { fontSize: 24, fontWeight: "700" },
  locationText: { fontSize: 13 },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
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
