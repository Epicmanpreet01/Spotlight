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
import api from "../../api/api";

export default function SettingsPanel({ onLogout = () => {} }) {
  const { theme, toggleTheme } = useTheme();
  const [darkOn, setDarkOn] = useState(theme.name === "dark");

  const onToggle = () => {
    setDarkOn((v) => !v);
    toggleTheme();
  };

  const onLogoutPress = () => {
    // In mock, reset token (if you use setAuthToken)
    try {
      if (api && api.setAuthToken) api.setAuthToken(null);
    } catch (e) {}
    Alert.alert("Logged out", "You have been logged out (mock).");
    onLogout();
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
      <Text style={[styles.heading, { color: theme.colors.text }]}>
        App Settings
      </Text>

      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Dark Mode
        </Text>
        <Switch value={darkOn} onValueChange={onToggle} />
      </View>

      <View style={styles.sep} />

      <TouchableOpacity
        style={styles.rowTouchable}
        onPress={() => {
          Alert.alert(
            "Privacy & Data",
            "We value your privacy. Your personal data (name, email, profile images) is stored securely and never shared without consent. We only use data to provide service features (bookings, notifications). When you upload images they are stored encrypted on our servers (mock). You can request data removal by contacting support."
          );
        }}
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

      <TouchableOpacity
        style={styles.rowTouchable}
        onPress={() => {
          Alert.alert(
            "About IGP",
            "IGP (Indie Gigs Platform) connects performers with events and bookers. This is a mock demo app — in production your bookings, reviews and profiles will be backed by a secure API and data protection policies."
          );
        }}
      >
        <Text style={[styles.label, { color: theme.colors.text }]}>
          About IGP
        </Text>
      </TouchableOpacity>

      <View style={styles.sep} />

      <TouchableOpacity style={styles.logoutBtn} onPress={onLogoutPress}>
        <Text style={{ color: "#fff", fontWeight: "700" }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

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
