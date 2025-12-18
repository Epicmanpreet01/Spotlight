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

import ImageViewerModal from "./ImageViewerModal";

import {
  useUpdatePerformerProfileMutation,
  useAddGalleryImagesMutation,
  useRemoveGalleryImageMutation,
} from "../../hooks/mutations/usePerformerMutation";

export default function PortfolioCard({ profile = {} }) {
  const { theme } = useTheme();

  /* ===================== STATE ===================== */
  const [editing, setEditing] = useState(false);
  const [previewUri, setPreviewUri] = useState(null);

  const [bio, setBio] = useState("");
  const [price, setPrice] = useState("");

  const images = Array.isArray(profile?.galleryImages)
    ? profile.galleryImages
    : [];

  useEffect(() => {
    setBio(profile?.bio || "");
    setPrice(profile?.priceStartingAt ? String(profile.priceStartingAt) : "");
  }, [profile]);

  /* ===================== MUTATIONS ===================== */
  const updateProfileMutation = useUpdatePerformerProfileMutation();
  const addImagesMutation = useAddGalleryImagesMutation();
  const removeImageMutation = useRemoveGalleryImageMutation();

  const saving =
    updateProfileMutation.isLoading ||
    addImagesMutation.isLoading ||
    removeImageMutation.isLoading;

  /* ===================== IMAGE PICKER ===================== */
  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Allow gallery access");
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

  /* ===================== IMAGE RENDERERS ===================== */
  const renderMainImage = ({ item }) => (
    <Pressable onPress={() => setPreviewUri(item)}>
      <Image source={{ uri: item }} style={styles.imageSmall} />
    </Pressable>
  );

  const renderModalImage = ({ item }) => (
    <View style={styles.modalImageWrapper}>
      <Pressable onPress={() => setPreviewUri(item)}>
        <Image source={{ uri: item }} style={styles.modalImage} />
      </Pressable>

      <TouchableOpacity
        style={styles.modalRemoveBtn}
        onPress={() => removeImageMutation.mutate({ imageUrl: item })}
      >
        <Ionicons name="close" size={16} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
      {/* ================= HEADER ================= */}
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

      {/* ================= INFO ================= */}
      <View style={{ marginTop: 10 }}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          Bio
        </Text>
        <Text style={[styles.value, { color: theme.colors.text }]}>
          {bio || "No bio yet."}
        </Text>
      </View>

      <View style={{ marginTop: 10 }}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          Starting Price (₹)
        </Text>
        <Text style={[styles.value, { color: theme.colors.text }]}>
          {price ? `₹${price}` : "-"}
        </Text>
      </View>

      {/* ================= MAIN GALLERY ================= */}
      <View style={{ marginTop: 12 }}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          Gallery
        </Text>

        <FlatList
          data={[...images, "__ADD__"]}
          horizontal
          keyExtractor={(i, idx) => i + idx}
          renderItem={({ item }) =>
            item === "__ADD__" ? (
              <TouchableOpacity
                onPress={() => setEditing(true)}
                style={styles.addSquareSmall}
              >
                <Ionicons name="add" size={26} color="#fff" />
              </TouchableOpacity>
            ) : (
              renderMainImage({ item })
            )
          }
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 6 }}
        />
      </View>

      {/* ================= EDIT MODAL ================= */}
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
              style={[
                styles.textarea,
                {
                  backgroundColor: theme.colors.inputBg,
                  color: theme.colors.textSecondary,
                },
              ]}
              value={bio}
              onChangeText={(t) => setBio(t.slice(0, 500))}
              multiline
            />

            {/* PRICE */}
            <Text
              style={[
                styles.label,
                { marginTop: 12, color: theme.colors.textSecondary },
              ]}
            >
              Starting Price (₹)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.inputBg,
                  color: theme.colors.textSecondary,
                },
              ]}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />

            {/* ===== MODAL GALLERY EDITOR ===== */}
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
              renderItem={({ item }) =>
                item === "__ADD__" ? (
                  <TouchableOpacity
                    onPress={pickImages}
                    style={styles.modalAddSquare}
                  >
                    <Ionicons name="add" size={28} color="#fff" />
                  </TouchableOpacity>
                ) : (
                  renderModalImage({ item })
                )
              }
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 10 }}
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
                <Text style={{ color: "#fff", fontWeight: "700" }}>
                  {saving ? "Saving..." : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= IMAGE PREVIEW ================= */}
      <ImageViewerModal
        visible={!!previewUri}
        uri={previewUri}
        onClose={() => setPreviewUri(null)}
      />
    </View>
  );
}

/* ===================== STYLES ===================== */
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

  imageSmall: {
    width: 64,
    height: 64,
    borderRadius: 10,
    marginRight: 10,
  },

  addSquareSmall: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: "#FF5722",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
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

  input: {
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  textarea: {
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    minHeight: 100,
  },

  modalImageWrapper: {
    marginRight: 12,
    position: "relative",
  },
  modalImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  modalRemoveBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#FF5252",
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  modalAddSquare: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: "#FF5722",
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
