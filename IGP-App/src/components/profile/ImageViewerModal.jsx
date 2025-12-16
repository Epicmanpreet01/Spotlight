// src/components/profile/ImageViewerModal.jsx
import React from 'react';
import { Modal, View, Image, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function ImageViewerModal({ visible = false, uri = null, onClose = () => {} }) {
  const { theme } = useTheme();

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Ionicons name="close" size={26} color="#fff" />
        </TouchableOpacity>
        {uri ? (
          <Image source={{ uri }} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={[styles.fallback, { backgroundColor: theme.colors.card }]}>
            <Text style={{ color: theme.colors.textSecondary }}>No image</Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  image: { width: '96%', height: '80%' },
  fallback: { width: '80%', height: 200, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  closeBtn: { position: 'absolute', top: 40, right: 20, zIndex: 30 },
});
