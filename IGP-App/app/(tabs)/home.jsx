import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../../src/context/ThemeContext";
import { useCurrentUser } from "../../src/hooks/queries/useAuth";
import { useGigsQuery } from "../../src/hooks/queries/useGigs";

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  // Fetch user
  const { data: userData } = useCurrentUser();

  // Fetch gigs
  const { data: feedData, isLoading, refetch } = useGigsQuery({}); // fetch all gigs

  if (isLoading)
    return (
      <View
        style={[styles.loading, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );

  const user = userData?.data;
  const isPerformer = user?.role === "performer";
  const feed = feedData?.data || [];

  const nearbyItems = feed.slice(0, 7);
  const recommendedItems = feed.slice(7, 12);

  const renderHorizontalCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.hCard, { backgroundColor: theme.colors.card }]}
      onPress={() => router.push(`/gig-details/${item._id}`)}
    >
      <Image source={{ uri: item.image }} style={styles.hCardImage} />
      <View style={styles.hCardContent}>
        <Text
          style={[styles.hCardTitle, { color: theme.colors.text }]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text style={styles.hCardPrice}>₹{item.budget}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: theme.colors.text }]}>
            Hello, {user?.name?.split(" ")[0]}!
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {isPerformer ? "Nearby Gigs" : "Talent Near You"}
          </Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/search")}>
            <Text style={[styles.seeAll, { color: theme.colors.primary }]}>
              See All
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          horizontal
          data={nearbyItems}
          renderItem={renderHorizontalCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.horizontalList}
        />

        <View style={[styles.sectionHeader, { marginTop: 25 }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Recommended
          </Text>
        </View>

        <View style={styles.verticalList}>
          {recommendedItems.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={[styles.vCard, { backgroundColor: theme.colors.card }]}
              onPress={() => router.push(`/gig-details/${item._id}`)}
            >
              <Image source={{ uri: item.image }} style={styles.vCardImage} />
              <View style={styles.vCardInfo}>
                <Text style={[styles.vCardTitle, { color: theme.colors.text }]}>
                  {item.title}
                </Text>
                <Text
                  style={[styles.vCardPrice, { color: theme.colors.primary }]}
                >
                  ₹{item.budget}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { padding: 20 },
  greeting: { fontSize: 24, fontWeight: "bold" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold" },
  seeAll: { fontSize: 14, fontWeight: "600" },
  horizontalList: { paddingHorizontal: 20, paddingBottom: 10 },
  hCard: {
    width: 200,
    borderRadius: 16,
    marginRight: 15,
    padding: 10,
    elevation: 3,
  },
  hCardImage: { width: "100%", height: 120, borderRadius: 12 },
  hCardContent: { marginTop: 10 },
  hCardTitle: { fontSize: 15, fontWeight: "bold" },
  hCardPrice: { color: "green", fontWeight: "bold" },
  verticalList: { paddingHorizontal: 20, gap: 15, paddingBottom: 40 },
  vCard: { flexDirection: "row", padding: 10, borderRadius: 16, elevation: 2 },
  vCardImage: { width: 70, height: 70, borderRadius: 12, marginRight: 15 },
  vCardInfo: { flex: 1, justifyContent: "center" },
  vCardTitle: { fontSize: 16, fontWeight: "bold" },
  vCardPrice: { fontWeight: "bold" },
});
