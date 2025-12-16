// src/components/booker/explore/BookerExploreEmptyState.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';

export default function BookerExploreEmptyState() {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={{ color: theme.colors.textSecondary }}>No performers matching your filters.</Text>
    </View>
  );
}

const styles = StyleSheet.create({ container: { padding: 30, alignItems: 'center' } });
