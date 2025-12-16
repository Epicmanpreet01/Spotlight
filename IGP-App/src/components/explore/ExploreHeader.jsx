// src/components/explore/ExploreHeader.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function ExploreHeader() {
  const { theme } = useTheme();
  return (
    <View style={styles.header}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Explore</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { padding: 20, paddingBottom: 10 },
  title: { fontSize: 32, fontWeight: 'bold' },
});
