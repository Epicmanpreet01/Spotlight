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
import { Video } from "expo-av";
import { useTheme } from "../../context/ThemeContext";

const isVideo = (uri = "") => uri.endsWith(".mp4") || uri.includes("video");

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
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={onClose}
          activeOpacity={0.85}
        >
          <Ionicons name="close" size={26} color="#fff" />
        </TouchableOpacity>

        {typeof uri === "string" && uri.length > 0 ? (
          isVideo(uri) ? (
            <Video
              source={{ uri }}
              style={styles.media}
              useNativeControls
              resizeMode="contain"
              shouldPlay
            />
          ) : (
            <Image source={{ uri }} style={styles.media} resizeMode="contain" />
          )
        ) : (
          <View
            style={[styles.fallback, { backgroundColor: theme.colors.card }]}
          >
            <Text style={{ color: theme.colors.textSecondary }}>No media</Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  media: {
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
