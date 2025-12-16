// src/components/booker/messages/BookerEmptyMessages.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../../constants/Colors';

export default function BookerEmptyMessages() {
  return (
    <View style={styles.container}>
      <Ionicons name="chatbubbles-outline" size={60} color={Colors.secondary} />
      <Text style={styles.text}>No chats yet</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 30
  },
  text: { marginTop: 10, color: '#888' },
});
