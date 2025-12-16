// src/components/booker/profile/BookerProfileHeader.jsx

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../context/ThemeContext";
import api from "../../../api/api";
import Colors from "../../../constants/Colors";
import * as ImagePicker from "expo-image-picker";

export default function BookerProfileHeader({
  user = {},
  onUpdated = () => {},
}) {
  const { theme } = useTheme();

  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [profileImage, setProfileImage] = useState(user?.profileImage || null);
  const [saving, setSaving] = useState(false);

  /* ------------------- Image Picker ------------------- */
  const pickImageFromLibrary = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Allow gallery access to update photo."
        );
        return;
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });

      if (!res.canceled) {
        setProfileImage(res.assets[0].uri);
      }
    } catch (err) {
      Alert.alert("Error", "Unable to open gallery.");
    }
  };

  /* ------------------- Save API ------------------- */
  const save = async () => {
    setSaving(true);
    try {
      // Booker: Update basic details
      await api.put("/users/profile", { name });

      // Booker: Update image if changed
      if (profileImage) {
        await api.put("/users/update-image", { imageUrl: profileImage });
      }

      Alert.alert("Success", "Profile updated.");
      setEditOpen(false);
      onUpdated();
    } catch (err) {
      Alert.alert("Error", "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
      {/* Avatar */}
      <View style={styles.left}>
        <View style={[styles.avatar, { backgroundColor: Colors.secondary }]}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.avatarImg} />
          ) : (
            <Text style={styles.avatarText}>
              {(user?.name || "U").charAt(0)}
            </Text>
          )}

          {/* Edit Button */}
          <TouchableOpacity
            style={styles.camBtn}
            onPress={() => setEditOpen(true)}
          >
            <Ionicons name="camera" size={14} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Name / Email / City */}
      <View style={styles.right}>
        <View style={styles.topRow}>
          <Text style={[styles.name, { color: theme.colors.text }]}>
            {user.name}
          </Text>

          <TouchableOpacity onPress={() => setEditOpen(true)}>
            <Ionicons
              name="create-outline"
              size={20}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.locationRow}>
          <Ionicons
            name="location-outline"
            size={14}
            color={theme.colors.textSecondary}
          />
          <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>
            {user.city || "Add your city"}
          </Text>
        </View>

        <Text
          style={[
            styles.meta,
            { color: theme.colors.textSecondary, marginTop: 4 },
          ]}
        >
          {user.email}
        </Text>
      </View>

      {/* EDIT MODAL */}
      <Modal visible={editOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalCard, { backgroundColor: theme.colors.card }]}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Edit Profile
            </Text>

            {/* Name Input */}
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Full Name
            </Text>
            <TextInput
              placeholder="Enter your name"
              placeholderTextColor={theme.colors.textSecondary}
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.inputBg,
                  color: theme.colors.text,
                },
              ]}
              value={name}
              onChangeText={setName}
            />

            {/* Image Picker */}
            <Text
              style={[
                styles.label,
                { color: theme.colors.textSecondary, marginTop: 14 },
              ]}
            >
              Profile Photo
            </Text>

            <View style={styles.imageRow}>
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.previewImg}
                />
              ) : (
                <View style={styles.emptyPreview}>
                  <Ionicons name="person" size={34} color="#999" />
                </View>
              )}

              <TouchableOpacity onPress={pickImageFromLibrary}>
                <View style={styles.btnPrimarySmall}>
                  <Text style={styles.btnPrimarySmallText}>Choose Photo</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.btnGhost}
                onPress={() => setEditOpen(false)}
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
    </View>
  );
}

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 12,
    elevation: 2,
    alignItems: "center",
  },

  left: { marginRight: 12 },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  avatarImg: { width: 64, height: 64, borderRadius: 32 },
  avatarText: { color: "#fff", fontSize: 24, fontWeight: "700" },

  camBtn: {
    position: "absolute",
    right: -0.1,
    bottom: -0.1,
    backgroundColor: "#1976D2",
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },

  right: { flex: 1 },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  name: { fontSize: 18, fontWeight: "700" },

  locationRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },

  meta: { fontSize: 13 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  modalCard: { borderRadius: 14, padding: 20 },

  modalTitle: { fontSize: 18, fontWeight: "700" },

  label: { marginTop: 12, fontSize: 12, fontWeight: "600" },

  input: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 6,
  },

  imageRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },

  previewImg: { width: 72, height: 72, borderRadius: 36 },

  emptyPreview: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#EEE",
    alignItems: "center",
    justifyContent: "center",
  },

  btnPrimarySmall: {
    backgroundColor: "#1976D2",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginLeft: 12,
  },
  btnPrimarySmallText: { color: "#fff", fontWeight: "700" },

  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  btnGhost: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#EEE",
  },

  btnPrimary: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#1976D2",
  },
});
