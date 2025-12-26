// src/components/explore/CategoryChips.jsx
import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { PERFORMER_CATEGORIES } from '../../constants/Categories';

export default function CategoryChips({ active = 'All', onSelect = () => {} }) {
  const { theme } = useTheme();

  // Build an 'All' + categories array
  const chips = ['All', ...PERFORMER_CATEGORIES];

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.colors.background }]}>
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
                isActive ? { backgroundColor: theme.colors.primary } : { backgroundColor: theme.colors.inputBg },
              ]}
              activeOpacity={0.85}
            >
              <Text style={[styles.chipText, isActive ? { color: '#fff' } : { color: theme.colors.text }]} numberOfLines={1}>
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
  wrapper: {
    // ensures chips have some vertical breathing room
    paddingVertical: 10,
  },
  container: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    minWidth: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
