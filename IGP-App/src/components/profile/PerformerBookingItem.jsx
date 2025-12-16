import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function PerformerBookingItem({ booking, onPress }) {
  const { theme } = useTheme();

  const statusColor =
    booking.status === 'confirmed'
      ? '#2E7D32'
      : booking.status === 'pending'
      ? '#FF9800'
      : '#D32F2F';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {booking.gig.title}
        </Text>
        <Text style={{ color: theme.colors.textSecondary }}>
          {new Date(booking.eventDate.start).toLocaleDateString()} •{' '}
          {booking.gig.location.address}
        </Text>
      </View>

      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ color: statusColor, fontWeight: '700' }}>
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
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: { fontSize: 16, fontWeight: '700' },
});
