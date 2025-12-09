import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Switch,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Colors from "../../src/constants/Colors.js";

import { useTheme } from "../../src/context/ThemeContext";
import api, { setAuthToken } from "../../src/api/api.js";

export default function ProfileScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { theme, toggleTheme, isDarkMode } = useTheme();

  const [isEditing, setIsEditing] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  // --- Fetch Data ---
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => (await api.get("/auth/me")).data,
  });

  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ["myBookings"],
    queryFn: async () => (await api.get("/booking/my-bookings")).data,
    enabled: !!userData,
  });

  const user = userData?.data;
  const profile = userData?.profile || {};
  const isPerformer = user?.role === "performer";
  const bookings = bookingsData?.data || [];

  // --- Edit States ---
  const [editName, setEditName] = useState("");
  const [editBandName, setEditBandName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCity, setEditCity] = useState("");

  // Sync state
  useEffect(() => {
    if (user) {
      setEditName(user.name || "");
      setEditCity(user.city || "");
      if (profile) {
        setEditBandName(profile.bandName || user.name || "");
        setEditBio(profile.bio || "");
        setEditPrice(String(profile.priceStartingAt || ""));
      }
    }
  }, [user, profile]);

  // --- Mutations ---
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => await api.put("/performers/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["currentUser"]);
      setIsEditing(false);
      Alert.alert("Success", "Profile updated!");
    },
  });

  const updateImageMutation = useMutation({
    mutationFn: async () => await api.put("/booking/updateUserImage", {}), // Mock upload
    onSuccess: () => {
      queryClient.invalidateQueries(["currentUser"]);
      Alert.alert("Success", "Profile picture updated!");
    },
  });

  const addGalleryImageMutation = useMutation({
    mutationFn: async () => await api.put("/performers/profile/add/images", {}),
    onSuccess: () => queryClient.invalidateQueries(["currentUser"]),
  });

  const deleteGalleryImageMutation = useMutation({
    mutationFn: async (imgUrl) =>
      await api.post("/performers/profile/delete/image", { imageUrl: imgUrl }),
    onSuccess: () => queryClient.invalidateQueries(["currentUser"]),
  });

  const handleSave = () => {
    updateProfileMutation.mutate({
      name: editName,
      bandName: editBandName,
      bio: editBio,
      priceStartingAt: Number(editPrice),
      city: editCity,
    });
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          setAuthToken(null);
          router.replace("/(auth)/sign-in");
        },
      },
    ]);
  };

  // Helper for Status Colors
  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "#4CAF50"; // Green
      case "pending":
        return "#FF9800"; // Orange
      case "completed":
        return "#2196F3"; // Blue
      default:
        return "#9E9E9E";
    }
  };

  if (userLoading)
    return (
      <View
        style={[styles.loading, { backgroundColor: theme.colors.background }]}
      >
        <Text style={{ color: theme.colors.text }}>Loading...</Text>
      </View>
    );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* --- 1. PERSONAL INFO & AVATAR --- */}
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.headerRow}>
            {/* Avatar with Edit Overlay */}
            <TouchableOpacity
              onPress={() => updateImageMutation.mutate()}
              activeOpacity={0.8}
            >
              {user?.profileImage ? (
                <Image
                  source={{ uri: user.profileImage }}
                  style={styles.avatarImage}
                />
              ) : (
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: theme.colors.primary },
                  ]}
                >
                  <Text style={styles.avatarText}>{user?.name?.charAt(0)}</Text>
                </View>
              )}
              <View style={styles.editBadge}>
                <Ionicons name="camera" size={14} color="#FFF" />
              </View>
            </TouchableOpacity>

            <View style={{ flex: 1, marginLeft: 15 }}>
              {isEditing ? (
                <>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: theme.colors.text,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Name"
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: theme.colors.text,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    value={editCity}
                    onChangeText={setEditCity}
                    placeholder="City"
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                </>
              ) : (
                <>
                  <Text style={[styles.name, { color: theme.colors.text }]}>
                    {user?.name}
                  </Text>
                  <Text style={{ color: theme.colors.textSecondary }}>
                    {user?.city} • {user?.email}
                  </Text>
                </>
              )}
            </View>
            <TouchableOpacity
              onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
            >
              <Ionicons
                name={isEditing ? "checkmark-circle" : "create-outline"}
                size={28}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* --- 2. PORTFOLIO (Performers Only) --- */}
        {isPerformer && (
          <View
            style={[
              styles.card,
              { backgroundColor: theme.colors.card, marginTop: 15 },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Portfolio
            </Text>

            <View style={styles.fieldContainer}>
              <Text
                style={[styles.label, { color: theme.colors.textSecondary }]}
              >
                Stage Name
              </Text>
              {isEditing ? (
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  value={editBandName}
                  onChangeText={setEditBandName}
                />
              ) : (
                <Text style={[styles.value, { color: theme.colors.text }]}>
                  {profile.bandName || user.name}
                </Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text
                style={[styles.label, { color: theme.colors.textSecondary }]}
              >
                Bio
              </Text>
              {isEditing ? (
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                      height: 80,
                    },
                  ]}
                  multiline
                  value={editBio}
                  onChangeText={setEditBio}
                />
              ) : (
                <Text style={[styles.value, { color: theme.colors.text }]}>
                  {profile.bio || "No bio yet."}
                </Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text
                style={[styles.label, { color: theme.colors.textSecondary }]}
              >
                Starting Price (₹)
              </Text>
              {isEditing ? (
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  keyboardType="numeric"
                  value={editPrice}
                  onChangeText={setEditPrice}
                />
              ) : (
                <Text
                  style={[
                    styles.value,
                    { color: theme.colors.primary, fontWeight: "bold" },
                  ]}
                >
                  {profile.priceStartingAt}
                </Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={[styles.label, { color: theme.colors.textSecondary }]}
                >
                  Gallery
                </Text>
                <TouchableOpacity
                  onPress={() => addGalleryImageMutation.mutate()}
                >
                  <Ionicons
                    name="add-circle"
                    size={24}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 10 }}
              >
                {profile.galleryImages?.map((img, i) => (
                  <View key={i} style={styles.galleryItem}>
                    <Image source={{ uri: img }} style={styles.galleryImg} />
                    {isEditing && (
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => deleteGalleryImageMutation.mutate(img)}
                      >
                        <Ionicons name="close" size={12} color="#FFF" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {/* --- 3. BOOKING HISTORY --- */}
        <Text
          style={[
            styles.headerTitle,
            { color: theme.colors.textSecondary, marginTop: 10 },
          ]}
        >
          Booking History
        </Text>
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          {bookingsLoading ? (
            <Text style={{ color: theme.colors.textSecondary }}>
              Loading...
            </Text>
          ) : bookings.length > 0 ? (
            bookings.map((booking) => (
              <View
                key={booking._id}
                style={[
                  styles.bookingItem,
                  { borderBottomColor: theme.colors.border },
                ]}
              >
                <View style={styles.bookingRow}>
                  <Text
                    style={[styles.bookingTitle, { color: theme.colors.text }]}
                  >
                    {booking.gig.title}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: getStatusColor(booking.status) + "20",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(booking.status) },
                      ]}
                    >
                      {booking.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text
                  style={{
                    color: theme.colors.textSecondary,
                    fontSize: 13,
                    marginTop: 4,
                  }}
                >
                  {new Date(booking.eventDate.start).toDateString()} •{" "}
                  {booking.gig.location.address}
                </Text>
                <Text
                  style={{
                    color: theme.colors.primary,
                    fontWeight: "bold",
                    marginTop: 4,
                  }}
                >
                  ₹{booking.totalPrice}
                </Text>
              </View>
            ))
          ) : (
            <Text
              style={{ color: theme.colors.textSecondary, fontStyle: "italic" }}
            >
              No bookings yet.
            </Text>
          )}
        </View>

        {/* --- 4. APP SETTINGS --- */}
        <Text
          style={[styles.headerTitle, { color: theme.colors.textSecondary }]}
        >
          App Settings
        </Text>
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.row}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name="moon-outline"
                size={22}
                color={theme.colors.text}
              />
              <Text style={[styles.rowText, { color: theme.colors.text }]}>
                Dark Mode
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ true: theme.colors.primary }}
            />
          </View>
          <View
            style={[styles.divider, { backgroundColor: theme.colors.border }]}
          />

          <TouchableOpacity
            style={styles.row}
            onPress={() => setActiveModal("privacy")}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name="shield-checkmark-outline"
                size={22}
                color={theme.colors.text}
              />
              <Text style={[styles.rowText, { color: theme.colors.text }]}>
                Privacy & Data
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
          <View
            style={[styles.divider, { backgroundColor: theme.colors.border }]}
          />

          <TouchableOpacity
            style={styles.row}
            onPress={() => setActiveModal("about")}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name="information-circle-outline"
                size={22}
                color={theme.colors.text}
              />
              <Text style={[styles.rowText, { color: theme.colors.text }]}>
                About IGP
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
          <View
            style={[styles.divider, { backgroundColor: theme.colors.border }]}
          />

          <TouchableOpacity style={styles.row} onPress={handleLogout}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="log-out-outline" size={22} color="red" />
              <Text style={[styles.rowText, { color: "red" }]}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* --- MODALS (Privacy/About) --- */}
      <Modal
        visible={activeModal === "privacy"}
        animationType="slide"
        transparent
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.card },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Privacy Policy
            </Text>
            <Text style={{ color: theme.colors.textSecondary }}>
              Your data is safe with us. We use end-to-end encryption for all
              sensitive data.
            </Text>
            <TouchableOpacity
              onPress={() => setActiveModal(null)}
              style={[
                styles.closeBtn,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Text style={{ color: "#FFF" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={activeModal === "about"}
        animationType="slide"
        transparent
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.card },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              About IGP
            </Text>
            <Text style={{ color: theme.colors.textSecondary }}>
              IGP (India Got Performers) v1.0.0{"\n"}The ultimate platform
              connecting talent with opportunities.
            </Text>
            <TouchableOpacity
              onPress={() => setActiveModal(null)}
              style={[
                styles.closeBtn,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Text style={{ color: "#FFF" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  headerRow: { flexDirection: "row", alignItems: "center" },

  // Avatar
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: { width: 60, height: 60, borderRadius: 30 },
  avatarText: { fontSize: 24, color: "#FFF", fontWeight: "bold" },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.textPrimary,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FFF",
  },

  name: { fontSize: 20, fontWeight: "bold" },
  input: {
    borderBottomWidth: 1,
    paddingVertical: 5,
    fontSize: 16,
    marginBottom: 5,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  fieldContainer: { marginBottom: 15 },
  label: { fontSize: 12, marginBottom: 4 },
  value: { fontSize: 15 },
  galleryImg: { width: 80, height: 80, borderRadius: 8 },
  galleryItem: { marginRight: 10, position: "relative" },
  deleteBtn: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "red",
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },

  // Settings
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    marginLeft: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  rowText: { fontSize: 16, marginLeft: 12, fontWeight: "500" },
  divider: { height: 1, marginLeft: 35 },

  // Booking History
  bookingItem: { paddingVertical: 12, borderBottomWidth: 1 },
  bookingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bookingTitle: { fontSize: 16, fontWeight: "bold" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  statusText: { fontSize: 10, fontWeight: "bold" },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: { borderRadius: 20, padding: 25 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  closeBtn: {
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
});
