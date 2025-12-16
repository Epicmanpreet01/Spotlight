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
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import api from "../../api/api";

const { width } = Dimensions.get("window");

export default function PortfolioCard({ profile = {}, onSave = () => {} }) {
  const { theme } = useTheme();
  const [editing, setEditing] = useState(false);

  const [stageName, setStageName] = useState(profile?.bandName || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [price, setPrice] = useState(
    profile?.priceStartingAt ? String(profile.priceStartingAt) : ""
  );
  const [images, setImages] = useState(profile?.galleryImages?.slice() || []);

  const [previewImage, setPreviewImage] = useState(null);

  // Mock add image (in real app you would open image-picker)
  const addImageMock = () => {
    if (images.length >= 10)
      return Alert.alert("Limit", "Maximum 10 images allowed.");
    const newImg =
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=900&q=80";
    setImages((prev) => [...prev, newImg]);
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const save = () => {
    const payload = {
      bandName: stageName,
      bio,
      priceStartingAt: Number(price || 0),
      galleryImages: images,
    };
    try {
      onSave(payload); // parent handles API update (your Profile screen uses mutation)
      setEditing(false);
      Alert.alert("Saved", "Portfolio saved (mock).");
    } catch (err) {
      Alert.alert("Error", "Failed to save.");
    }
  };

  const renderImageItem = ({ item, index }) => (
    <View style={styles.imageWrapper}>
      <Pressable
        onPress={() => setPreviewImage(item)}
        style={{ borderRadius: 10, overflow: "hidden" }}
      >
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
          onPress={() => removeImage(index)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
          {profile?.priceStartingAt ? `₹${profile.priceStartingAt}` : "-"}
        </Text>
      </View>

      <View style={{ marginTop: 12 }}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          Gallery
        </Text>

        {/* Non-edit mode: show images (if any) in small size */}
        {!editing && images.length === 0 && (
          <View style={{ marginTop: 12 }}>
            <Text style={{ color: theme.colors.textSecondary }}>
              No gallery images yet.
            </Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
              Tap Edit to add images.
            </Text>
          </View>
        )}

        <View style={{ marginTop: 8 }}>
          <FlatList
            data={images}
            horizontal
            keyExtractor={(i, idx) => String(idx)}
            renderItem={renderImageItem}
            ListFooterComponent={() => (
              <TouchableOpacity
                onPress={() => (editing ? addImageMock() : setEditing(true))}
                style={[
                  styles.addSquare,
                  editing ? styles.addSquareLarge : styles.addSquareSmall,
                ]}
              >
                <Ionicons name="add" size={26} color="#fff" />
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 6 }}
          />
        </View>
      </View>

      {/* Edit modal */}
      <Modal visible={editing} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalCard, { backgroundColor: theme.colors.card }]}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Edit Portfolio
            </Text>

            <Text
              style={[
                styles.label,
                { color: theme.colors.textSecondary, marginTop: 12 },
              ]}
            >
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
              placeholder="Stage / Band name"
              placeholderTextColor={theme.colors.textSecondary}
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
              numberOfLines={4}
              placeholder="Write about your act (max 500 characters)"
              placeholderTextColor={theme.colors.textSecondary}
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
              placeholder="e.g. 15000"
              placeholderTextColor={theme.colors.textSecondary}
            />

            <View style={{ marginTop: 12 }}>
              <Text
                style={[styles.label, { color: theme.colors.textSecondary }]}
              >
                Gallery
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  marginTop: 8,
                  alignItems: "center",
                }}
              >
                <FlatList
                  data={images}
                  horizontal
                  keyExtractor={(i, idx) => idx.toString()}
                  renderItem={({ item, index }) => (
                    <View
                      style={{
                        marginRight: 10,
                        alignItems: "center",
                        position: "relative",
                      }}
                    >
                      <Pressable
                        onPress={() => setPreviewImage(item)}
                        style={{ borderRadius: 10, overflow: "hidden" }}
                      >
                        <Image
                          source={{ uri: item }}
                          style={{ width: 96, height: 96, borderRadius: 10 }}
                        />
                      </Pressable>

                      <TouchableOpacity
                        onPress={() => removeImage(index)}
                        style={styles.removeBtnBelow}
                      >
                        <Text style={{ color: "#fff", fontWeight: "700" }}>
                          Remove
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                />
                <TouchableOpacity
                  onPress={addImageMock}
                  style={[styles.addSquareSmallEdit]}
                >
                  <Ionicons name="add" size={22} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

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
              <TouchableOpacity style={styles.btnPrimary} onPress={save}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Preview image modal */}
      <Modal visible={!!previewImage} animationType="fade" transparent>
        <View style={styles.previewOverlay}>
          <TouchableOpacity
            style={styles.previewCloseArea}
            onPress={() => setPreviewImage(null)}
          />
          <View style={styles.previewCard}>
            <Image
              source={{ uri: previewImage }}
              style={styles.previewImage}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={styles.previewCloseBtn}
              onPress={() => setPreviewImage(null)}
            >
              <Ionicons name="close" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

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
