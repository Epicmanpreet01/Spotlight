// src/components/home/HomeEmptyState.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function HomeEmptyState() {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={{ color: theme.colors.textSecondary }}>No gigs available right now.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 30, alignItems: 'center' },
});
