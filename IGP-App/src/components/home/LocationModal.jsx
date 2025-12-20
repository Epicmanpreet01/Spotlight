import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { detectLocation } from "../../utils/detectLocation";
import { searchLocation } from "../../utils/locationSearch";

export default function BookerLocationModal({
  visible,
  initialStreet = "",
  initialCity = "",
  onClose = () => {},
  onSave = () => {},
}) {
  const { theme } = useTheme();

  const [addressQuery, setAddressQuery] = useState("");
  const [locationData, setLocationData] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  /* ===================== INIT ===================== */
  useEffect(() => {
    if (visible) {
      // If city already exists, show it in input
      setAddressQuery(initialStreet || initialCity || "");
      setLocationData(null);
      setSuggestion(null);
    }
  }, [visible, initialStreet, initialCity]);

  /* ===================== AUTOCOMPLETE ===================== */
  useEffect(() => {
    // 🔒 Only search when user is actively typing
    if (!isTyping || !addressQuery || addressQuery.length < 2) {
      setSuggestion(null);
      return;
    }

    const timeout = setTimeout(async () => {
      const results = await searchLocation(addressQuery);
      setSuggestion(results?.[0] || null);
    }, 500);

    return () => clearTimeout(timeout);
  }, [addressQuery, isTyping]);

  /* ===================== AUTO DETECT ===================== */
  const handleDetect = async () => {
    try {
      setIsDetecting(true);
      const result = await detectLocation();
      if (!result) return;

      setAddressQuery(result.address || result.city || "");
      setLocationData({
        lat: result.location.coordinates[1],
        lon: result.location.coordinates[0],
        address: { city: result.city },
      });
      setSuggestion(null);
    } finally {
      setIsDetecting(false);
    }
  };

  /* ===================== SAVE ===================== */
  const handleSave = () => {
    if (!locationData) {
      Alert.alert("Location required", "Please select a valid location");
      return;
    }

    const city =
      locationData.address?.city ||
      locationData.address?.town ||
      locationData.address?.village ||
      locationData.address?.county ||
      locationData.address?.state ||
      "";

    onSave({
      city: city.trim(),
      location: {
        type: "Point",
        coordinates: [Number(locationData.lon), Number(locationData.lat)],
      },
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.sheetContainer}>
            <View
              style={[styles.sheet, { backgroundColor: theme.colors.card }]}
            >
              <View
                style={[styles.grab, { backgroundColor: theme.colors.border }]}
              />

              <Text style={[styles.title, { color: theme.colors.text }]}>
                Set your location
              </Text>

              {/* ADDRESS INPUT */}
              <Text
                style={[styles.label, { color: theme.colors.textSecondary }]}
              >
                Address
              </Text>

              <View style={styles.inputWrapper}>
                <View
                  style={[
                    styles.inputBox,
                    { backgroundColor: theme.colors.inputBg },
                  ]}
                >
                  <TextInput
                    value={addressQuery}
                    onChangeText={(text) => {
                      setAddressQuery(text);
                      setIsTyping(true);
                      setLocationData(null);
                    }}
                    placeholder="Search address"
                    placeholderTextColor={theme.colors.textSecondary}
                    style={[styles.input, { color: theme.colors.text }]}
                  />
                </View>

                {/* 🔽 SINGLE RESULT FLOATING DROPDOWN */}
                {suggestion && (
                  <TouchableOpacity
                    style={[
                      styles.dropdown,
                      {
                        backgroundColor: theme.colors.card,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    activeOpacity={0.85}
                    onPress={() => {
                      setAddressQuery(suggestion.display_name);
                      setLocationData(suggestion);
                      setSuggestion(null);
                    }}
                  >
                    <Text style={{ color: theme.colors.text }}>
                      {suggestion.display_name}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* DETECT */}
              <TouchableOpacity
                style={[
                  styles.detectBtn,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={handleDetect}
                disabled={isDetecting}
              >
                <Ionicons name="locate" size={16} color="#fff" />
                <Text style={styles.detectText}>
                  {isDetecting ? "Detecting..." : "Use Current Location"}
                </Text>
              </TouchableOpacity>

              {/* ACTIONS */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[
                    styles.cancel,
                    { backgroundColor: theme.colors.inputBg },
                  ]}
                  onPress={onClose}
                >
                  <Text style={{ color: theme.colors.textSecondary }}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.save,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={handleSave}
                >
                  <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

/* ===================== STYLES ===================== */
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    paddingBottom: Platform.OS === "ios" ? 34 : 18,
  },
  sheet: {
    marginHorizontal: 10,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 18,
  },
  grab: {
    width: 40,
    height: 4,
    borderRadius: 4,
    alignSelf: "center",
    marginBottom: 10,
  },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  label: { fontSize: 12, marginBottom: 6 },
  inputWrapper: { position: "relative", zIndex: 20 },
  inputBox: { borderWidth: 1, borderRadius: 10 },
  input: { padding: 12 },

  /* FLOATING DROPDOWN */
  dropdown: {
    position: "absolute",
    top: 52,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    zIndex: 999,
    elevation: 10,
  },

  detectBtn: {
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
  },
  detectText: { color: "#fff", marginLeft: 8, fontWeight: "700" },
  actions: { flexDirection: "row", marginTop: 16 },
  cancel: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    marginRight: 10,
    alignItems: "center",
  },
  save: { flex: 1, padding: 12, borderRadius: 10 },
  saveText: { color: "#fff", fontWeight: "700", textAlign: "center" },
});
