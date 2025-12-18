// src/components/profile/PortfolioCard.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  Alert,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import * as ImagePicker from "expo-image-picker";
import * as VideoThumbnails from "expo-video-thumbnails";

import ImageViewerModal from "./ImageViewerModal";

import {
  useUpdatePerformerProfileMutation,
  useAddGalleryImagesMutation,
  useRemoveGalleryImageMutation,
} from "../../hooks/mutations/usePerformerMutation";

const isVideo = (uri = "") => uri.endsWith(".mp4") || uri.includes("video");

export default function PortfolioCard({ profile = {} }) {
  const { theme } = useTheme();

  const [editing, setEditing] = useState(false);
  const [previewUri, setPreviewUri] = useState(null);
  const [videoThumbs, setVideoThumbs] = useState({});

  const [bio, setBio] = useState("");
  const [price, setPrice] = useState("");

  const images = Array.isArray(profile?.galleryImages)
    ? profile.galleryImages
    : [];

  /* Sync ONLY when modal closes */
  useEffect(() => {
    if (!editing) {
      setBio(profile?.bio || "");
      setPrice(profile?.priceStartingAt ? String(profile.priceStartingAt) : "");
    }
  }, [profile, editing]);

  const updateProfileMutation = useUpdatePerformerProfileMutation();
  const addImagesMutation = useAddGalleryImagesMutation();
  const removeImageMutation = useRemoveGalleryImageMutation();

  const saving =
    updateProfileMutation.isLoading ||
    addImagesMutation.isLoading ||
    removeImageMutation.isLoading;

  /* ===================== IMAGE PICKER ===================== */
  const pickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Allow gallery access");
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!res.canceled) {
      await addImagesMutation.mutateAsync(res.assets);
    }
  };

  /* ===================== SAVE ===================== */
  const save = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        bio,
        priceStartingAt: Number(price || 0),
      });

      Alert.alert("Saved", "Portfolio updated successfully");
      setEditing(false);
    } catch {
      Alert.alert("Error", "Failed to save portfolio");
    }
  };

  /* ===================== THUMB ===================== */
  const getVideoThumbnail = async (uri) => {
    if (videoThumbs[uri]) return;

    try {
      const { uri: thumbUri } = await VideoThumbnails.getThumbnailAsync(uri, {
        time: 1000,
      });

      setVideoThumbs((prev) => ({ ...prev, [uri]: thumbUri }));
    } catch (e) {
      console.warn("Thumbnail error:", e);
    }
  };

  const renderThumb = (uri) => {
    if (isVideo(uri)) {
      if (!videoThumbs[uri]) {
        getVideoThumbnail(uri);
      }

      return (
        <View style={styles.thumbWrapper}>
          {videoThumbs[uri] ? (
            <Image source={{ uri: videoThumbs[uri] }} style={styles.thumb} />
          ) : (
            <View style={[styles.thumb, { backgroundColor: "#000" }]} />
          )}

          <Ionicons
            name="play-circle"
            size={26}
            color="#fff"
            style={styles.playIcon}
          />
        </View>
      );
    }

    return (
      <View style={styles.thumbWrapper}>
        <Image source={{ uri }} style={styles.thumb} />
      </View>
    );
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Portfolio
        </Text>
        <TouchableOpacity onPress={() => setEditing(true)}>
          <Ionicons
            name="create-outline"
            size={20}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* INFO */}
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
        Bio
      </Text>
      <Text style={[styles.value, { color: theme.colors.text }]}>
        {bio || "No bio yet."}
      </Text>

      <Text
        style={[
          styles.label,
          { marginTop: 10, color: theme.colors.textSecondary },
        ]}
      >
        Starting Price (₹)
      </Text>
      <Text style={[styles.value, { color: theme.colors.text }]}>
        {price ? `₹${price}` : "-"}
      </Text>

      {/* GALLERY */}
      <Text
        style={[
          styles.label,
          { marginTop: 12, color: theme.colors.textSecondary },
        ]}
      >
        Gallery
      </Text>

      <FlatList
        data={[...images, "__ADD__"]}
        horizontal
        keyExtractor={(i, idx) => i + idx}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 6 }}
        renderItem={({ item }) =>
          item === "__ADD__" ? (
            <TouchableOpacity
              style={styles.addSquare}
              onPress={() => setEditing(true)}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          ) : (
            <Pressable onPress={() => setPreviewUri(item)}>
              {renderThumb(item)}
            </Pressable>
          )
        }
      />

      {/* EDIT MODAL */}
      <Modal visible={editing} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalCard, { backgroundColor: theme.colors.card }]}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Edit Portfolio
            </Text>

            {/* BIO */}
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Bio (max 500)
            </Text>
            <TextInput
              value={bio}
              onChangeText={(t) => setBio(t.slice(0, 500))}
              multiline
              style={[
                styles.textarea,
                {
                  backgroundColor: theme.colors.inputBg,
                  color: theme.colors.text,
                },
              ]}
            />

            {/* 🔥 RESTORED STARTING PRICE */}
            <Text
              style={[
                styles.label,
                { marginTop: 12, color: theme.colors.textSecondary },
              ]}
            >
              Starting Price (₹)
            </Text>
            <TextInput
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.inputBg,
                  color: theme.colors.text,
                },
              ]}
            />

            {/* GALLERY */}
            <Text
              style={[
                styles.label,
                { marginTop: 14, color: theme.colors.textSecondary },
              ]}
            >
              Gallery
            </Text>

            <FlatList
              data={[...images, "__ADD__"]}
              horizontal
              keyExtractor={(i, idx) => i + idx}
              contentContainerStyle={{ paddingVertical: 10 }}
              renderItem={({ item }) =>
                item === "__ADD__" ? (
                  <TouchableOpacity
                    style={styles.addSquare}
                    onPress={pickMedia}
                  >
                    <Ionicons name="add" size={24} color="#fff" />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.modalImageWrapper}>
                    <Pressable onPress={() => setPreviewUri(item)}>
                      {renderThumb(item)}
                    </Pressable>
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() =>
                        removeImageMutation.mutate({ imageUrl: item })
                      }
                    >
                      <Ionicons name="close" size={14} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )
              }
            />

            {/* ACTIONS */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.btnGhost}
                onPress={() => setEditing(false)}
              >
                <Text style={{ color: theme.colors.textSecondary }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={save}
                disabled={saving}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ImageViewerModal
        visible={!!previewUri}
        uri={previewUri}
        onClose={() => setPreviewUri(null)}
      />
    </View>
  );
}

/* ===================== STYLES ===================== */
const SIZE = 64;

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 14,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 16, fontWeight: "700" },
  label: { fontSize: 12, fontWeight: "600" },
  value: { marginTop: 6, fontSize: 14 },

  thumbWrapper: {
    width: SIZE,
    height: SIZE,
    marginRight: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
  thumb: {
    width: SIZE,
    height: SIZE,
    borderRadius: 10,
  },
  playIcon: {
    position: "absolute",
    alignSelf: "center",
    top: "30%",
  },

  addSquare: {
    width: SIZE,
    height: SIZE,
    borderRadius: 10,
    backgroundColor: "#FF5722",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "92%",
    borderRadius: 12,
    padding: 16,
    maxHeight: "86%",
  },
  modalTitle: { fontSize: 18, fontWeight: "700" },

  textarea: {
    marginTop: 6,
    padding: 12,
    borderRadius: 10,
    minHeight: 100,
  },
  input: {
    marginTop: 6,
    padding: 12,
    borderRadius: 10,
  },

  modalImageWrapper: {
    marginRight: 10,
    position: "relative",
  },
  removeBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#FF5252",
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },
  btnGhost: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#F0F0F0",
  },
  btnPrimary: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#FF5722",
  },
});
