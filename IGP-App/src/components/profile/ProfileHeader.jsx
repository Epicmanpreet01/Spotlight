// src/components/profile/ProfileHeader.jsx
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
import { useTheme } from "../../context/ThemeContext";
import Colors from "../../constants/Colors";
import * as ImagePicker from "expo-image-picker";

/* ===================== MUTATION HOOKS ===================== */
import {
  useUpdateUserProfileMutation,
  useUpdateUserProfileImageMutation,
} from "../../hooks/mutations/useUserMutation";

export default function ProfileHeader({ user = {}, onEdit = () => {} }) {
  const { theme } = useTheme();

  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [profileImage, setProfileImage] = useState(null);

  /* ===================== MUTATIONS ===================== */
  const updateProfileMutation = useUpdateUserProfileMutation();
  const updateImageMutation = useUpdateUserProfileImageMutation();

  const saving =
    updateProfileMutation.isLoading || updateImageMutation.isLoading;

  /* ===================== IMAGE PICKER ===================== */
  const pickImageFromLibrary = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Please allow access to your photo library."
        );
        return;
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });

      if (!res.canceled) {
        setProfileImage(res.assets[0]);
      }
    } catch (e) {
      Alert.alert("Error", "Unable to open gallery.");
    }
  };

  /* ===================== SAVE ===================== */
  const save = async () => {
    try {
      // Update name (User)
      if (name !== user?.name) {
        await updateProfileMutation.mutateAsync({ name });
      }

      // Update profile image (User)
      if (profileImage?.uri) {
        await updateImageMutation.mutateAsync(profileImage);
      }

      Alert.alert("Saved", "Profile updated successfully.");
      setEditOpen(false);
      onEdit();
    } catch {
      Alert.alert("Error", "Failed to update profile.");
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
      {/* ================= AVATAR ================= */}
      <View style={styles.left}>
        <View style={[styles.avatar, { backgroundColor: Colors.primary }]}>
          {profileImage?.uri || user?.profileImage ? (
            <Image
              source={{
                uri: profileImage?.uri || user?.profileImage,
              }}
              style={styles.avatarImg}
            />
          ) : (
            <Text style={styles.avatarText}>
              {(user?.name || "J").charAt(0)}
            </Text>
          )}

          <TouchableOpacity
            style={styles.camBtn}
            onPress={() => setEditOpen(true)}
          >
            <Ionicons name="camera" size={14} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ================= INFO ================= */}
      <View style={styles.right}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={[styles.name, { color: theme.colors.text }]}>
            {user?.name || "John Doe"}
          </Text>
          <TouchableOpacity onPress={() => setEditOpen(true)}>
            <Ionicons
              name="create-outline"
              size={20}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </View>

        <View
          style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}
        >
          <Ionicons
            name="location-outline"
            size={14}
            color={theme.colors.textSecondary}
          />
          <Text
            style={[
              styles.meta,
              { color: theme.colors.textSecondary, marginLeft: 6 },
            ]}
          >
            {user?.city || "Add your city"}
          </Text>
        </View>

        <Text
          style={[
            styles.meta,
            { color: theme.colors.textSecondary, marginTop: 6 },
          ]}
        >
          {user?.email}
        </Text>
      </View>

      {/* ================= EDIT MODAL ================= */}
      <Modal visible={editOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalCard, { backgroundColor: theme.colors.card }]}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Edit profile
            </Text>

            <Text
              style={[
                styles.label,
                { color: theme.colors.textSecondary, marginTop: 12 },
              ]}
            >
              Name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.inputBg,
                  color: theme.colors.text,
                },
              ]}
              placeholder="Your display name"
              placeholderTextColor={theme.colors.textSecondary}
            />

            <Text
              style={[
                styles.label,
                { color: theme.colors.textSecondary, marginTop: 12 },
              ]}
            >
              Profile Photo
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 8,
              }}
            >
              {profileImage?.uri || user?.profileImage ? (
                <Image
                  source={{
                    uri: profileImage?.uri || user?.profileImage,
                  }}
                  style={{ width: 72, height: 72, borderRadius: 36 }}
                />
              ) : (
                <View
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    backgroundColor: "#EEE",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="person" size={34} color="#999" />
                </View>
              )}

              <TouchableOpacity
                style={{ marginLeft: 12 }}
                onPress={pickImageFromLibrary}
              >
                <View style={styles.btnPrimarySmall}>
                  <Text style={{ color: "#fff", fontWeight: "700" }}>
                    Choose Photo
                  </Text>
                </View>
              </TouchableOpacity>
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

/* ===================== STYLES (UNCHANGED) ===================== */
const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  left: { marginRight: 12 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  avatarText: { color: "#fff", fontSize: 24, fontWeight: "700" },
  avatarImg: { width: 64, height: 64, borderRadius: 32 },
  camBtn: {
    position: "absolute",
    right: -0.1,
    bottom: -0.1,
    backgroundColor: "#FF5722",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  right: { flex: 1 },
  name: { fontSize: 18, fontWeight: "700" },
  meta: { fontSize: 13 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: { width: "92%", borderRadius: 12, padding: 18 },
  modalTitle: { fontSize: 18, fontWeight: "700" },
  label: { fontSize: 12, fontWeight: "600" },
  input: {
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
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
  btnPrimarySmall: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#FF5722",
    alignItems: "center",
    justifyContent: "center",
  },
});
