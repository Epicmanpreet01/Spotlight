// src/components/explore/FilterPanel.jsx
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function FilterPanel({ isOpen = false, onToggle }) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity onPress={onToggle} style={{ backgroundColor: theme.colors.primary, padding: 12, borderRadius: 12 }}>
      <Ionicons name={isOpen ? 'close' : 'options-outline'} size={20} color="#FFF" />
    </TouchableOpacity>
  );
}
