// src/components/profile/ImageViewerModal.jsx
import React from "react";
import {
  Modal,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

export default function ImageViewerModal({
  visible = false,
  uri = null,
  onClose = () => {},
}) {
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose} // ✅ Android back button support
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* CLOSE BUTTON */}
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={onClose}
          activeOpacity={0.85}
        >
          <Ionicons name="close" size={26} color="#fff" />
        </TouchableOpacity>

        {/* IMAGE / FALLBACK */}
        {typeof uri === "string" && uri.length > 0 ? (
          <Image source={{ uri }} style={styles.image} resizeMode="contain" />
        ) : (
          <View
            style={[styles.fallback, { backgroundColor: theme.colors.card }]}
          >
            <Text style={{ color: theme.colors.textSecondary }}>No image</Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

/* ===================== STYLES (UNCHANGED) ===================== */
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "96%",
    height: "80%",
  },
  fallback: {
    width: "80%",
    height: 200,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    right: 20,
    zIndex: 30,
  },
});
