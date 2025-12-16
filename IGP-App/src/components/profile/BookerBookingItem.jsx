import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function BookerBookingItem({ booking, onPress }) {
  const { theme } = useTheme();

  const statusColor =
    booking.status === 'confirmed'
      ? '#2E7D32'
      : booking.status === 'pending'
      ? '#FF9800'
      : '#1976D2';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.card, { borderColor: theme.colors.border }]}
      onPress={onPress}
    >
      <View>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {booking.gig.title}
        </Text>
        <Text style={{ color: theme.colors.textSecondary, marginTop: 4 }}>
          {new Date(booking.eventDate.start).toLocaleDateString()} •{' '}
          {booking.gig.location.address}
        </Text>
      </View>

      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ color: statusColor, fontWeight: '800' }}>
          {booking.status.toUpperCase()}
        </Text>
        <Text style={{ marginTop: 6, fontWeight: '700', color: '#FF6F00' }}>
          ₹{booking.totalPrice}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    marginBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
});
