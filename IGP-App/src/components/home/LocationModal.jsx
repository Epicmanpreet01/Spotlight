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

import { detectLocation } from "../../utils/detectLocation.js";

export default function LocationModal({
  visible,
  initialStreet = "",
  initialCity = "",
  onClose = () => {},
  onSave = () => {},
}) {
  const { theme } = useTheme();

  const [streetAddress, setStreetAddress] = useState(initialStreet);
  const [cityState, setCityState] = useState(initialCity);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    if (visible) {
      setStreetAddress(initialStreet || "");
      setCityState(initialCity || "");
    }
  }, [visible, initialStreet, initialCity]);

  /* ===================== DETECT ===================== */
  const handleUseCurrentLocation = async () => {
    try {
      setIsDetecting(true);

      const loc = await detectLocation();
      if (!loc) return;

      setStreetAddress(loc.address || "");
      setCityState(loc.city || "");
    } catch (e) {
      Alert.alert(
        "Location Error",
        "Unable to detect your location. Please enter it manually."
      );
    } finally {
      setIsDetecting(false);
    }
  };

  /* ===================== SAVE ===================== */
  const handleSave = () => {
    if (!cityState?.trim()) {
      Alert.alert("Missing City", "Please enter your city");
      return;
    }

    onSave({
      streetAddress: streetAddress.trim(),
      cityState: cityState.trim(),
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      presentationStyle="overFullScreen"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.avoider}
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

              <Text
                style={[styles.label, { color: theme.colors.textSecondary }]}
              >
                Street / Address
              </Text>

              <View
                style={[
                  styles.inputBox,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <TextInput
                  placeholder="House no, street, landmark"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={streetAddress}
                  onChangeText={setStreetAddress}
                  style={[styles.input, { color: theme.colors.text }]}
                />
              </View>

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
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <TextInput
                  placeholder="City, State"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={cityState}
                  onChangeText={setCityState}
                  style={[styles.input, { color: theme.colors.text }]}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.detectBtn,
                  { backgroundColor: theme.colors.primary },
                ]}
                activeOpacity={0.85}
                onPress={handleUseCurrentLocation}
                disabled={isDetecting}
              >
                <Ionicons name="locate" size={16} color="#fff" />
                <Text style={styles.detectBtnText}>
                  {isDetecting ? "Detecting..." : "Use Current Location"}
                </Text>
              </TouchableOpacity>

              <View style={styles.buttonsRow}>
                <TouchableOpacity
                  style={[
                    styles.cancelBtn,
                    { backgroundColor: theme.colors.border },
                  ]}
                  onPress={onClose}
                  disabled={isDetecting}
                >
                  <Text
                    style={[styles.cancelText, { color: theme.colors.text }]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.saveBtn,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={handleSave}
                  disabled={isDetecting}
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

const SHEET_BORDER_RADIUS = 16;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  avoider: {
    width: "100%",
  },
  sheetContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999,
    elevation: 99999,
    paddingBottom: Platform.OS === "ios" ? 34 : 18,
  },
  sheet: {
    marginHorizontal: 10,
    borderTopLeftRadius: SHEET_BORDER_RADIUS,
    borderTopRightRadius: SHEET_BORDER_RADIUS,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
    elevation: 10,
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
  inputBox: {
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  detectBtn: {
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  detectBtnText: { color: "#FFF", marginLeft: 8, fontWeight: "700" },
  buttonsRow: {
    flexDirection: "row",
    marginTop: 14,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelText: { fontWeight: "600" },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "700" },
});
