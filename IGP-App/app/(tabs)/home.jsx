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

import { useCurrentUser } from "../../src/hooks/queries/useAuth";
import { useGigsQuery } from "../../src/hooks/queries/useGigs";
import { usePerformersQuery } from "../../src/hooks/queries/usePerformers";
import { useNotifications } from "../../src/hooks/queries/useNotifications";
import { useUpdateLocationMutation } from "../../src/hooks/mutations/useUpdateLocationMutation";

import {
  NearbyGigsList,
  RecommendedGigsList,
  HomeEmptyState,
} from "../../src/components/home";
import LocationModal from "../../src/components/home/LocationModal";

import BookerHomeHeader from "../../src/components/booker/home/BookerHomeHeader";
import BookerNearbyList from "../../src/components/booker/home/BookerNearbyList";
import BookerRecommendedList from "../../src/components/booker/home/BookerRecommendedList";

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const [isLocationModalOpen, setLocationModalOpen] = useState(false);

  const { data: userResp, isLoading: isAuthLoading } = useCurrentUser();
  const user = userResp?.data || null;
  const role = user?.role || null;

  const { data: notifications = [] } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const {
    data: gigsResp,
    isLoading: gigsLoading,
    refetch: refetchGigs,
  } = useGigsQuery({}, role === "performer");

  const {
    data: performersResp,
    isLoading: perfLoading,
    refetch: refetchPerformers,
  } = usePerformersQuery({}, role === "booker");

  const gigs = gigsResp?.data || [];
  const performers = performersResp?.data || [];

  const nearbyGigs = gigs.slice(0, 7);
  const recommendedGigs = gigs.slice(7, 12);

  const nearbyPerformers = performers.slice(0, 4);
  const recommendedPerformers = performers.slice(4);

  const { mutate: updateLocation } = useUpdateLocationMutation();

  if (isAuthLoading) {
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
          <View style={[styles.topRow, { paddingHorizontal: 20 }]}>
            <View>
              <Text style={[styles.greeting, { color: theme.colors.text }]}>
                Hello, {user.name.split(" ")[0]}!
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
          onSave={({ cityState }) => {
            updateLocation({ city: cityState });
            setLocationModalOpen(false);
          }}
        />
      </SafeAreaView>
    );
  }

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
        <BookerHomeHeader user={user} unreadCount={unreadCount} />

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
    </SafeAreaView>
  );
}

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
