// app/(tabs)/search.jsx
import React, { useState, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useQuery } from "@tanstack/react-query";
import api from "../../src/api/api";
import { useTheme } from "../../src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

// Performer components (existing)
import ExploreHeader from "../../src/components/explore/ExploreHeader";
import CategoryChips from "../../src/components/explore/CategoryChips";
import GigCard from "../../src/components/explore/GigCard";
import ExploreEmptyState from "../../src/components/explore/ExploreEmptyState";
import SearchBar from "../../src/components/explore/SearchBar";
import FilterDropdown from "../../src/components/explore/FilterDropdown";

// Booker components (new)
import BookerExploreHeader from "../../src/components/booker/explore/BookerExploreHeader";
import BookerCategoryChips from "../../src/components/booker/explore/BookerCategoryChips";
import BookerPerformerCard from "../../src/components/booker/explore/BookerPerformerCard";
import BookerExploreEmptyState from "../../src/components/booker/explore/BookerExploreEmptyState";
import BookerFilterDropdown from "../../src/components/booker/explore/BookerFilterDropdown";

export default function SearchScreen() {
  const { theme } = useTheme();

  // UI state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [queryText, setQueryText] = useState("");

  // filters from dropdown
  const [budgetFilter, setBudgetFilter] = useState(null); // {min, max}
  const [dateFilter, setDateFilter] = useState(null); // 'week' | 'month' | null

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

  const { data } = useQuery({
    queryKey: ["gigs"],
    queryFn: async () => (await api.get("/gigs")).data,
    retry: false,
  });

  const gigs = data?.data || [];

  // compute date ranges used for filtering
  const now = new Date();
  const startOfWeek = (() => {
    const d = new Date(now);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  })();
  const endOfWeek = (() => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + 7);
    return d;
  })();
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // client-side filtering: category, search text, budget, date
  const filtered = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    return gigs.filter((g) => {
      const byCategory =
        activeCategory === "All" ||
        (g.categoryRequired || "").toLowerCase() ===
          activeCategory.toLowerCase();

      const byQuery =
        !q ||
        (g.title || "").toLowerCase().includes(q) ||
        (g.description || "").toLowerCase().includes(q);

      let byBudget = true;
      if (budgetFilter && typeof budgetFilter.min === "number") {
        const b = Number(g.budget || 0);
        byBudget = b >= budgetFilter.min && b <= (budgetFilter.max ?? b);
      }

      let byDate = true;
      if (dateFilter === "week") {
        const ev = new Date(g.eventDate?.start);
        byDate = ev >= startOfWeek && ev <= endOfWeek;
      } else if (dateFilter === "month") {
        const ev = new Date(g.eventDate?.start);
        byDate = ev < startOfNextMonth;
      }

      return byCategory && byQuery && byBudget && byDate;
    });
  }, [gigs, activeCategory, queryText, budgetFilter, dateFilter]);

  // If booker -> show performers instead. We will query performers endpoint (mock) for booker.
  const role = userResp?.data?.role;
  const { data: performersResp } = useQuery({
    queryKey: ["performersList"],
    queryFn: async () => {
      try {
        return (await api.get("/performers")).data;
      } catch (e) {
        return null;
      }
    },
    enabled: role === "booker",
    retry: false,
  });
  const performers = performersResp?.data || [];

  if (role === "booker") {
    // Booker's explore: discover performers (uses performer filter by category + text)
    const filteredPerformers = performers.filter((p) => {
      const q = queryText.trim().toLowerCase();
      const byCategory =
        activeCategory === "All" ||
        (p.category || "").toLowerCase() === activeCategory.toLowerCase();
      const byQuery =
        !q ||
        (p.user?.name || "").toLowerCase().includes(q) ||
        (p.bio || "").toLowerCase().includes(q);
      return byCategory && byQuery;
    });

    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <BookerExploreHeader />

        <View style={styles.searchRow}>
          <View style={{ flex: 1 }}>
            <SearchBar
              placeholder="Search performers..."
              value={queryText}
              onChangeText={setQueryText}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.filterBtn,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => setIsFilterOpen(true)}
          >
            <Ionicons name="options" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <BookerCategoryChips
          active={activeCategory}
          onSelect={setActiveCategory}
        />

        {filteredPerformers.length === 0 ? (
          <BookerExploreEmptyState />
        ) : (
          <FlatList
            data={filteredPerformers}
            keyExtractor={(i) => i._id}
            renderItem={({ item }) => <BookerPerformerCard item={item} />}
            contentContainerStyle={{ padding: 20 }}
            showsVerticalScrollIndicator={false}
          />
        )}

        <BookerFilterDropdown
          visible={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          onApply={(filter) => {
            if (filter?.type === "budget") {
              setBudgetFilter({ min: filter.min, max: filter.max });
            }
            setIsFilterOpen(false);
          }}
        />
      </SafeAreaView>
    );
  }

  // Performer explore (unchanged)
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ExploreHeader />

      <View style={styles.searchRow}>
        <View style={{ flex: 1 }}>
          <SearchBar
            placeholder="Search gigs, artists..."
            value={queryText}
            onChangeText={setQueryText}
          />
        </View>

        <TouchableOpacity
          style={[styles.filterBtn, { backgroundColor: theme.colors.primary }]}
          onPress={() => setIsFilterOpen(true)}
        >
          <Ionicons name="options" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <CategoryChips
        active={activeCategory}
        onSelect={(cat) => setActiveCategory(cat)}
      />

      {filtered.length === 0 ? (
        <ExploreEmptyState />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => <GigCard item={item} />}
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FilterDropdown
        visible={isFilterOpen}
        mode="performer"
        onClose={() => setIsFilterOpen(false)}
        onApply={(filter) => {
          if (filter?.type === "budget") {
            setBudgetFilter({ min: filter.min, max: filter.max });
          } else if (filter?.type === "date") {
            setDateFilter(filter.value);
          }
          setIsFilterOpen(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchRow: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  filterBtn: {
    marginLeft: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
});
