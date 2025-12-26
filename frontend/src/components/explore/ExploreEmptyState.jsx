// src/components/explore/ExploreEmptyState.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function ExploreEmptyState() {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={{ color: theme.colors.textSecondary }}>No gigs found.</Text>
    </View>
  );
}

const styles = StyleSheet.create({ container: { padding: 30, alignItems: 'center' } });
