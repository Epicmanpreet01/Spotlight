// src/components/profile/PortfolioCard.jsx
import React, { useState } from "react";
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

/* ===================== HOOKS ===================== */
import {
  useUpdatePerformerProfileMutation,
  useAddGalleryImagesMutation,
  useRemoveGalleryImageMutation,
} from "../../hooks/mutations/usePerformerMutation";

export default function PortfolioCard({ profile = {} }) {
  const { theme } = useTheme();
  const [editing, setEditing] = useState(false);

  /* ===================== STATE ===================== */
  const [stageName, setStageName] = useState(profile?.bandName || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [price, setPrice] = useState(
    profile?.priceStartingAt ? String(profile.priceStartingAt) : ""
  );
  const initialImages = Array.isArray(profile?.galleryImages)
    ? [...profile.galleryImages]
    : [];

  const [images, setImages] = useState(initialImages);
  const [previewImage, setPreviewImage] = useState(null);

  /* ===================== MUTATIONS ===================== */
  const updateProfileMutation = useUpdatePerformerProfileMutation();
  const addImagesMutation = useAddGalleryImagesMutation();
  const removeImageMutation = useRemoveGalleryImageMutation();

  const saving =
    updateProfileMutation.isLoading ||
    addImagesMutation.isLoading ||
    removeImageMutation.isLoading;

  /* ===================== IMAGE PICKER ===================== */
  const pickImage = async () => {
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

  /* ===================== REMOVE IMAGE ===================== */
  const removeImage = async (imageUrl) => {
    try {
      await removeImageMutation.mutateAsync({ imageUrl });
    } catch {}
  };

  /* ===================== SAVE ===================== */
  const save = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        bandName: stageName,
        bio,
        priceStartingAt: Number(price || 0),
      });

      Alert.alert("Saved", "Portfolio updated successfully");
      setEditing(false);
    } catch {
      Alert.alert("Error", "Failed to save portfolio");
    }
  };

  /* ===================== IMAGE ITEM ===================== */
  const renderImageItem = ({ item }) => (
    <View style={styles.imageWrapper}>
      <Pressable onPress={() => setPreviewImage(item)}>
        <Image
          source={{ uri: item }}
          style={[
            styles.image,
            editing ? styles.imageLarge : styles.imageSmall,
          ]}
        />
      </Pressable>

      {editing && (
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => removeImage(item)}
        >
          <View style={styles.removeCircle}>
            <Text style={styles.removeX}>✕</Text>
          </View>
        </TouchableOpacity>
      )}
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
      <View style={{ marginTop: 12 }}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          Stage Name
        </Text>
        <Text style={[styles.value, { color: theme.colors.text }]}>
          {stageName || "No stage name yet."}
        </Text>
      </View>

      <View style={{ marginTop: 10 }}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          Bio
        </Text>
        <Text
          style={[styles.value, { color: theme.colors.text }]}
          numberOfLines={4}
        >
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

      {/* ================= GALLERY ================= */}
      <View style={{ marginTop: 12 }}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          Gallery
        </Text>

        <FlatList
          data={images}
          horizontal
          keyExtractor={(i) => i}
          renderItem={renderImageItem}
          ListFooterComponent={
            <TouchableOpacity
              onPress={editing ? pickImage : () => setEditing(true)}
              style={[
                styles.addSquare,
                editing ? styles.addSquareLarge : styles.addSquareSmall,
              ]}
            >
              <Ionicons name="add" size={26} color="#fff" />
            </TouchableOpacity>
          }
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 6 }}
        />
      </View>

      {/* ================= EDIT MODAL ================= */}
      <Modal visible={editing} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalCard, { backgroundColor: theme.colors.card }]}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Edit Portfolio
            </Text>

            {/* Inputs */}
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Stage Name
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.inputBg,
                  color: theme.colors.text,
                },
              ]}
              value={stageName}
              onChangeText={setStageName}
            />

            <Text
              style={[
                styles.label,
                { color: theme.colors.textSecondary, marginTop: 12 },
              ]}
            >
              Bio (max 500)
            </Text>
            <TextInput
              style={[
                styles.textarea,
                {
                  backgroundColor: theme.colors.inputBg,
                  color: theme.colors.text,
                },
              ]}
              value={bio}
              onChangeText={(t) => setBio(t.slice(0, 500))}
              multiline
            />

            <Text
              style={[
                styles.label,
                { color: theme.colors.textSecondary, marginTop: 12 },
              ]}
            >
              Starting Price (₹)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.inputBg,
                  color: theme.colors.text,
                },
              ]}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />

            {/* Actions */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 18,
              }}
            >
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
      <Modal visible={!!previewImage} transparent animationType="fade">
        <View style={styles.previewOverlay}>
          <TouchableOpacity
            style={styles.previewCloseArea}
            onPress={() => setPreviewImage(null)}
          />
          <Image
            source={{ uri: previewImage }}
            style={styles.previewImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </View>
  );
}

/* ===================== STYLES (UNCHANGED) ===================== */
// 🔥 EXACT SAME styles as your original file

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 16, fontWeight: "700" },

  label: { fontSize: 12, fontWeight: "600" },
  value: { marginTop: 6, fontSize: 14 },

  addSquare: {
    marginLeft: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  addSquareSmall: { width: 64, height: 64, backgroundColor: "#FF5722" },
  addSquareLarge: { width: 86, height: 86, backgroundColor: "#FF5722" },
  addSquareSmallEdit: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: "#FF5722",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },

  imageWrapper: { marginRight: 12, position: "relative" },
  image: { borderRadius: 10 },
  imageSmall: { width: 64, height: 64 },
  imageLarge: { width: 96, height: 96 },

  removeBtn: { position: "absolute", top: -8, right: -8 },
  removeCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FF5252",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  removeX: { color: "#fff", fontWeight: "700" },

  removeBtnBelow: {
    marginTop: 6,
    backgroundColor: "#FF5252",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: { width: "92%", borderRadius: 12, padding: 16, maxHeight: "86%" },

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

  // preview modal
  previewOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  previewCard: {
    width: "92%",
    height: "70%",
    alignItems: "center",
    justifyContent: "center",
  },
  previewImage: { width: "100%", height: "100%" },
  previewCloseBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 8,
    borderRadius: 20,
  },
  previewCloseArea: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});
