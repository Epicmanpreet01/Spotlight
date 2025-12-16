// src/components/booker/messages/BookerChatListItem.jsx
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';

export default function BookerChatListItem({ chat, onPress }) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.row, { backgroundColor: theme.colors.card }]}
    >
      <View style={styles.avatar} />

      <View style={{ flex: 1 }}>
        <Text style={[styles.name, { color: theme.colors.text }]}>
          {chat?.name || 'Unknown'}
        </Text>

        <Text
          style={[styles.msg, { color: theme.colors.textSecondary }]}
          numberOfLines={1}
        >
          {chat?.lastMessage || 'Say hello!'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DDD',
    marginRight: 12,
  },
  name: { fontWeight: '700' },
  msg: { marginTop: 2 },
});
