import React, { useState, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../src/context/ThemeContext";

/* ===================== HOOKS ===================== */
import { useCurrentUser } from "../../src/hooks/queries/useAuth";
import { useGigsQuery } from "../../src/hooks/queries/useGigs";
import { usePerformersQuery } from "../../src/hooks/queries/usePerformers";

/* ===================== PERFORMER COMPONENTS ===================== */
import ExploreHeader from "../../src/components/explore/ExploreHeader";
import CategoryChips from "../../src/components/explore/CategoryChips";
import GigCard from "../../src/components/explore/GigCard";
import ExploreEmptyState from "../../src/components/explore/ExploreEmptyState";
import SearchBar from "../../src/components/explore/SearchBar";
import FilterDropdown from "../../src/components/explore/FilterDropdown";

/* ===================== BOOKER COMPONENTS ===================== */
import BookerExploreHeader from "../../src/components/booker/explore/BookerExploreHeader";
import BookerCategoryChips from "../../src/components/booker/explore/BookerCategoryChips";
import BookerPerformerCard from "../../src/components/booker/explore/BookerPerformerCard";
import BookerExploreEmptyState from "../../src/components/booker/explore/BookerExploreEmptyState";
import BookerFilterDropdown from "../../src/components/booker/explore/BookerFilterDropdown";

export default function SearchScreen() {
  const { theme } = useTheme();

  /* ===================== UI STATE ===================== */
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [queryText, setQueryText] = useState("");

  const [budgetFilter, setBudgetFilter] = useState(null);
  const [dateFilter, setDateFilter] = useState(null);

  /* ===================== USER ===================== */
  const { data: me } = useCurrentUser();
  const role = me?.data?.role;

  /* ===================== DATA ===================== */
  const {
    data: gigsResp,
    fetchNextPage: fetchMoreGigs,
    hasNextPage: hasMoreGigs,
  } = useGigsQuery({}, role === "performer");

  const gigs = useMemo(() => {
    return gigsResp?.pages?.flatMap((p) => p.data) || [];
  }, [gigsResp]);

  const {
    data: performersResp,
    fetchNextPage: fetchMorePerformers,
    hasNextPage: hasMorePerformers,
  } = usePerformersQuery({}, role === "booker");

  const performers = useMemo(() => {
    return performersResp?.pages?.flatMap((p) => p.data) || [];
  }, [performersResp]);

  /* ===================== DATE HELPERS ===================== */
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

  /* ===================== PERFORMER FILTERING ===================== */
  const filteredGigs = useMemo(() => {
    const q = queryText.trim().toLowerCase();

    return gigs.filter((g) => {
      const byCategory =
        activeCategory === "All" ||
        g.categoryRequired?.toLowerCase() === activeCategory.toLowerCase();

      const byQuery =
        !q ||
        g.title?.toLowerCase().includes(q) ||
        g.description?.toLowerCase().includes(q);

      let byBudget = true;
      if (budgetFilter?.min != null) {
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

  /* ===================== BOOKER FILTERING ===================== */
  const filteredPerformers = useMemo(() => {
    const q = queryText.trim().toLowerCase();

    return performers.filter((p) => {
      const byCategory =
        activeCategory === "All" ||
        p.category?.toLowerCase() === activeCategory.toLowerCase();

      const byQuery =
        !q ||
        p.user?.name?.toLowerCase().includes(q) ||
        p.bio?.toLowerCase().includes(q);

      let byBudget = true;
      if (budgetFilter?.min != null) {
        const b = Number(p.priceStartingAt || 0);
        byBudget = b >= budgetFilter.min && b <= (budgetFilter.max ?? b);
      }

      return byCategory && byQuery && byBudget;
    });
  }, [performers, activeCategory, queryText, budgetFilter]);

  /* ===================== BOOKER VIEW ===================== */
  if (role === "booker") {
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
            onEndReached={() => {
              if (hasMorePerformers) {
                fetchMorePerformers();
              }
            }}
            onEndReachedThreshold={0.5}
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

  /* ===================== PERFORMER VIEW ===================== */
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

      {filteredGigs.length === 0 ? (
        <ExploreEmptyState />
      ) : (
        <FlatList
          data={filteredGigs}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => <GigCard item={item} />}
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (hasMoreGigs) {
              fetchMoreGigs();
            }
          }}
          onEndReachedThreshold={0.5}
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

/* ===================== STYLES ===================== */
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
