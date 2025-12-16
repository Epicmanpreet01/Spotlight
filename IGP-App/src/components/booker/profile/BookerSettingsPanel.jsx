// src/components/booker/profile/BookerSettingsPanel.jsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useTheme } from "../../../context/ThemeContext";
import api from "../../../api/api";

export default function BookerSettingsPanel({ onLogout = () => {} }) {
  const { theme, toggleTheme } = useTheme();
  const [darkOn, setDarkOn] = useState(theme.isDark);

  const onDarkToggle = () => {
    setDarkOn((prev) => !prev);
    toggleTheme();
  };

  const handleLogout = () => {
    try {
      if (api && api.setAuthToken) api.setAuthToken(null);
    } catch (e) {}

    Alert.alert("Logout", "You have been logged out.");
    onLogout();
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
      {/* ======= APP SETTINGS HEADING ======= */}
      <Text style={[styles.heading, { color: theme.colors.text }]}>
        App Settings
      </Text>

      {/* ======= DARK MODE ======= */}
      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Dark Mode
        </Text>
        <Switch value={darkOn} onValueChange={onDarkToggle} />
      </View>

      <View style={styles.sep} />

      {/* ======= PRIVACY ======= */}
      <TouchableOpacity
        style={styles.rowTouchable}
        onPress={() =>
          Alert.alert(
            "Privacy & Data",
            "We value your privacy. Your information is safely stored and never shared. You may request data removal anytime."
          )
        }
      >
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Privacy & Data
        </Text>
      </TouchableOpacity>

      <View style={styles.description}>
        <Text style={{ color: theme.colors.textSecondary }}>
          Tap to read more.
        </Text>
      </View>

      <View style={styles.sep} />

      {/* ======= ABOUT ======= */}
      <TouchableOpacity
        style={styles.rowTouchable}
        onPress={() =>
          Alert.alert(
            "About IGP",
            "IGP (Indie Gigs Platform) connects performers with event organizers. This is a demo version."
          )
        }
      >
        <Text style={[styles.label, { color: theme.colors.text }]}>
          About IGP
        </Text>
      </TouchableOpacity>

      <View style={styles.sep} />

      {/* ======= LOGOUT ======= */}
      <TouchableOpacity
        style={[styles.logoutBtn, { backgroundColor: theme.colors.primary }]}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 16,
    elevation: 2,
    shadowOpacity: 0.05,
  },
  heading: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  rowTouchable: {
    paddingVertical: 12,
  },
  sep: {
    height: 1,
    backgroundColor: "#EEE",
    marginVertical: 10,
  },
  description: {
    marginBottom: 8,
  },
  logoutBtn: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
