// src/components/profile/SettingsPanel.jsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";

/* ===================== HOOKS ===================== */
import { useLogoutMutation } from "../../hooks/mutations/useAuthMutation";

export default function SettingsPanel({ onLogout = () => {} }) {
  const { theme, toggleTheme } = useTheme();
  const [darkOn, setDarkOn] = useState(theme.name === "dark");

  const logoutMutation = useLogoutMutation();

  const onToggle = () => {
    setDarkOn((v) => !v);
    toggleTheme();
  };

  const onLogoutPress = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logoutMutation.mutateAsync();
            onLogout(); // parent can close modals etc.
          } catch {
            Alert.alert("Error", "Failed to logout. Try again.");
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
      <Text style={[styles.heading, { color: theme.colors.text }]}>
        App Settings
      </Text>

      {/* ===== DARK MODE ===== */}
      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Dark Mode
        </Text>
        <Switch value={darkOn} onValueChange={onToggle} />
      </View>

      <View style={styles.sep} />

      {/* ===== PRIVACY ===== */}
      <TouchableOpacity
        style={styles.rowTouchable}
        onPress={() =>
          Alert.alert(
            "Privacy & Data",
            "We value your privacy. Your personal data (name, email, profile images) is stored securely and never shared without consent. You can request data removal anytime."
          )
        }
      >
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Privacy & Data
        </Text>
      </TouchableOpacity>

      <View style={styles.description}>
        <Text style={{ color: theme.colors.textSecondary }}>
          Tap Privacy & Data to read more.
        </Text>
      </View>

      <View style={styles.sep} />

      {/* ===== ABOUT ===== */}
      <TouchableOpacity
        style={styles.rowTouchable}
        onPress={() =>
          Alert.alert(
            "About IGP",
            "IGP (Indie Gigs Platform) connects performers with event organizers. This is a demo build."
          )
        }
      >
        <Text style={[styles.label, { color: theme.colors.text }]}>
          About IGP
        </Text>
      </TouchableOpacity>

      <View style={styles.sep} />

      {/* ===== LOGOUT ===== */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={onLogoutPress}
        disabled={logoutMutation.isLoading}
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>
          {logoutMutation.isLoading ? "Logging out..." : "Logout"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/* ===================== STYLES (UNCHANGED) ===================== */
const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 14, elevation: 2, shadowOpacity: 0.05 },
  heading: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  label: { fontSize: 14, fontWeight: "600" },
  rowTouchable: { paddingVertical: 12 },
  sep: { height: 1, backgroundColor: "#EEE", marginVertical: 8 },
  description: { marginBottom: 8 },
  logoutBtn: {
    marginTop: 12,
    backgroundColor: "#FF6B3A",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
});
