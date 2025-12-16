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
import { useTheme } from "../../../context/ThemeContext";
import { detectLocation } from "../../../utils/detectLocation";
import { searchLocation } from "../../../utils/locationSearch";

export default function BookerLocationModal({
  visible,
  initialStreet = "",
  initialCity = "",
  onClose = () => {},
  onSave = () => {},
}) {
  const { theme } = useTheme();

  const [streetAddress, setStreetAddress] = useState(initialStreet);
  const [cityState, setCityState] = useState(initialCity);
  const [coordinates, setCoordinates] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    if (visible) {
      setStreetAddress(initialStreet || "");
      setCityState(initialCity || "");
      setCoordinates(null);
    }
  }, [visible, initialStreet, initialCity]);

  /* ===================== AUTO DETECT ===================== */
  const handleDetect = async () => {
    try {
      setIsDetecting(true);
      const result = await detectLocation();
      if (!result) return;

      setStreetAddress(result.address || "");
      setCityState(result.city || "");
      setCoordinates(result.location.coordinates);
    } finally {
      setIsDetecting(false);
    }
  };

  /* ===================== SAVE ===================== */
  const handleSave = async () => {
    if (!cityState?.trim()) {
      Alert.alert("Missing City", "Please enter your city");
      return;
    }

    let finalCoords = coordinates;

    // Manual entry → geocode
    if (!finalCoords) {
      const results = await searchLocation(`${streetAddress} ${cityState}`);

      if (!results.length) {
        Alert.alert("Error", "Unable to locate this address");
        return;
      }

      finalCoords = [Number(results[0].lon), Number(results[0].lat)];
    }

    onSave({
      city: cityState.trim(),
      location: {
        type: "Point",
        coordinates: finalCoords,
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

              {/* STREET */}
              <Text
                style={[styles.label, { color: theme.colors.textSecondary }]}
              >
                Street / Address
              </Text>
              <View
                style={[
                  styles.inputBox,
                  { backgroundColor: theme.colors.inputBg },
                ]}
              >
                <TextInput
                  value={streetAddress}
                  onChangeText={setStreetAddress}
                  placeholder="House no, street, landmark"
                  placeholderTextColor={theme.colors.textSecondary}
                  style={[styles.input, { color: theme.colors.text }]}
                />
              </View>

              {/* CITY */}
              <Text
                style={[
                  styles.label,
                  { marginTop: 10, color: theme.colors.textSecondary },
                ]}
              >
                City, State
              </Text>
              <View
                style={[
                  styles.inputBox,
                  { backgroundColor: theme.colors.inputBg },
                ]}
              >
                <TextInput
                  value={cityState}
                  onChangeText={setCityState}
                  placeholder="City, State"
                  placeholderTextColor={theme.colors.textSecondary}
                  style={[styles.input, { color: theme.colors.text }]}
                />
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
  inputBox: { borderWidth: 1, borderRadius: 10 },
  input: { padding: 12 },
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
  saveText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
  },
});
