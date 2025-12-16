import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { useRouter } from 'expo-router';
import BookerLocationModal from '../../booker/home/BookerLocationModal';

export default function BookerHomeHeader({ user = {} }) {
  const { theme } = useTheme();
  const router = useRouter();
  const [isLocationModalOpen, setLocationModalOpen] = useState(false);

  const handlePressBell = () => {
    router.push('/notifications'); // <-- Notification page
  };

  return (
    <>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.row}>

          {/* LEFT SIDE */}
          <View style={{ flex: 1 }}>
            <Text style={[styles.greeting, { color: theme.colors.text }]}>
              Hello, {user?.name ? user.name.split(' ')[0] : 'User'}!
            </Text>

            <TouchableOpacity
              onPress={() => setLocationModalOpen(true)}
              style={styles.locationRow}
              activeOpacity={0.7}
            >
              <Ionicons
                name="location-outline"
                size={14}
                color={theme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.locationText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {user?.city || 'Set your location'}
              </Text>

              <Ionicons
                name="pencil"
                size={14}
                color={theme.colors.textSecondary}
                style={{ marginLeft: 6 }}
              />
            </TouchableOpacity>
          </View>

          {/* NOTIFICATION BELL */}
          <TouchableOpacity
            onPress={handlePressBell}
            style={styles.bellWrap}
            activeOpacity={0.7}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>

        </View>
      </View>

      {/* LOCATION MODAL */}
      <BookerLocationModal
        visible={isLocationModalOpen}
        initialCity={user?.city || ''}
        onClose={() => setLocationModalOpen(false)}
        onSave={({ cityState }) => {
          // handle saving later if needed
          setLocationModalOpen(false);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  locationText: {
    marginLeft: 6,
    fontSize: 13,
  },
  bellWrap: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
