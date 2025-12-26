// src/components/booker/explore/BookerExploreHeader.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';

export default function BookerExploreHeader() {
  const { theme } = useTheme();
  return (
    <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Discover Performers</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { padding: 20, paddingBottom: 10 },
  title: { fontSize: 32, fontWeight: '700' },
});
