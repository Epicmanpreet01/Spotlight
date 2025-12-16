// src/components/booker/explore/BookerCategoryChips.jsx
import React from "react";
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from "react-native";
import { useTheme } from "../../../context/ThemeContext";
import { PERFORMER_CATEGORIES } from "../../../constants/Categories";

export default function BookerCategoryChips({
  active = "All",
  onSelect = () => {},
}) {
  const { theme } = useTheme();
  const chips = ["All", ...PERFORMER_CATEGORIES];

  return (
    <View
      style={[styles.wrapper, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {chips.map((c) => {
          const isActive = c === active;
          return (
            <TouchableOpacity
              key={c}
              onPress={() => onSelect(c)}
              style={[
                styles.chip,
                isActive
                  ? { backgroundColor: theme.colors.primary }
                  : { backgroundColor: theme.colors.inputBg },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  isActive ? { color: "#fff" } : { color: theme.colors.text },
                ]}
              >
                {c}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingVertical: 10 },
  container: { paddingHorizontal: 20, alignItems: "center" },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  chipText: { fontSize: 13, fontWeight: "600" },
});
