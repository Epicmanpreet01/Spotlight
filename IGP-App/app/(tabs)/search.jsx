import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  LayoutAnimation,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";

import { useTheme } from "../../src/context/ThemeContext";
import api from "../../src/api/api.js";
import { PERFORMER_CATEGORIES } from "../../src/constants/Categories.js";

export default function SearchScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [activeCategory, setActiveCategory] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch Data
  const { data: feedData } = useQuery({
    queryKey: ["gigs"],
    queryFn: async () => (await api.get("/gigs")).data,
  });
  const allGigs = feedData?.data || [];

  const toggleFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsFilterOpen(!isFilterOpen);
  };

  const renderCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.card }]}
      onPress={() => router.push(`/gig-details/${item._id}`)}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <View style={styles.row}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            {item.title}
          </Text>
          <Text style={styles.cardPrice}>₹{item.budget}</Text>
        </View>
        <Text style={styles.cardSub}>
          {item.categoryRequired} • {item.location.city}
        </Text>
        <Text style={styles.cardDate}>
          {new Date(item.eventDate.start).toDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Explore
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: theme.colors.inputBg,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Ionicons
            name="search"
            size={20}
            color={theme.colors.textSecondary}
          />
          <TextInput
            style={[styles.input, { color: theme.colors.text }]}
            placeholder="Search gigs, artists..."
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, { backgroundColor: theme.colors.primary }]}
          onPress={toggleFilter}
        >
          <Ionicons
            name={isFilterOpen ? "close" : "options-outline"}
            size={24}
            color="#FFF"
          />
        </TouchableOpacity>
      </View>

      {/* DROPDOWN FILTER SECTION */}
      {isFilterOpen && (
        <View
          style={[
            styles.filterSection,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.filterLabel, { color: theme.colors.text }]}>
            Budget
          </Text>
          <View style={styles.filterRow}>
            {["Low", "Medium", "High"].map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.filterChip,
                  { backgroundColor: theme.colors.inputBg },
                ]}
              >
                <Text style={{ color: theme.colors.text }}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.filterLabel, { color: theme.colors.text }]}>
            Date
          </Text>
          <View style={styles.filterRow}>
            {["Today", "This Week", "This Month"].map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.filterChip,
                  { backgroundColor: theme.colors.inputBg },
                ]}
              >
                <Text style={{ color: theme.colors.text }}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Category Chips */}
      <View style={{ height: 50 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          <TouchableOpacity
            style={[
              styles.chip,
              activeCategory === "All" && styles.activeChip,
              {
                backgroundColor:
                  activeCategory === "All"
                    ? theme.colors.primary
                    : theme.colors.inputBg,
              },
            ]}
            onPress={() => setActiveCategory("All")}
          >
            <Text
              style={[
                styles.chipText,
                activeCategory === "All"
                  ? styles.activeChipText
                  : { color: theme.colors.text },
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {PERFORMER_CATEGORIES.map((cat, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.chip,
                activeCategory === cat && styles.activeChip,
                {
                  backgroundColor:
                    activeCategory === cat
                      ? theme.colors.primary
                      : theme.colors.inputBg,
                },
              ]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text
                style={[
                  styles.chipText,
                  activeCategory === cat
                    ? styles.activeChipText
                    : { color: theme.colors.text },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={allGigs}
        renderItem={renderCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingBottom: 10 },
  title: { fontSize: 32, fontWeight: "bold" },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 15,
    alignItems: "center",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
  },
  input: { marginLeft: 10, flex: 1, fontSize: 16 },
  filterBtn: { padding: 12, borderRadius: 12 },

  // Filter Dropdown
  filterSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 5,
  },
  filterRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  filterChip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },

  categoryScroll: { paddingHorizontal: 20 },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    height: 35,
  },
  activeChip: {},
  chipText: { fontSize: 13, fontWeight: "600" },
  activeChipText: { color: "#FFF" },

  list: { padding: 20 },
  card: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cardImage: { width: "100%", height: 160 },
  cardContent: { padding: 15 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: { fontSize: 16, fontWeight: "bold" },
  cardPrice: { fontSize: 16, fontWeight: "bold", color: "green" },
  cardSub: { fontSize: 14, color: "#666", marginTop: 5 },
  cardDate: { fontSize: 12, color: "#999", marginTop: 4 },
});
