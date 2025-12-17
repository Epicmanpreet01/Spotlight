import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Keyboard,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../context/ThemeContext";

/*
 Booker Filter:
  - Budget ONLY
*/

export default function BookerFilterDropdown({
  visible,
  onClose = () => {},
  onApply = () => {},
}) {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(null); // 'budget' | null

  const [min, setMin] = useState("");
  const [max, setMax] = useState("");

  if (!visible) return null;

  const presets = [
    { label: "0 - 5k", min: 0, max: 5000 },
    { label: "5k - 20k", min: 5000, max: 20000 },
    { label: "20k - 100k", min: 20000, max: 100000 },
  ];

  /* ================= Selection helpers ================= */

  const hasBudgetSelected = min !== "" || max !== "";

  const isPresetSelected = (p) =>
    String(p.min) === min && String(p.max) === max;

  /* ================= Actions ================= */

  const applyPreset = (p) => {
    // Toggle OFF if already selected
    if (isPresetSelected(p)) {
      setMin("");
      setMax("");
      onApply({ type: "budget", min: 0, max: Infinity });
      onClose();
      return;
    }

    setMin(String(p.min));
    setMax(String(p.max));
    onApply({ type: "budget", min: p.min, max: p.max });
    onClose();
  };

  const applyCustomBudget = () => {
    const parsedMin = Math.max(0, Number(min) || 0);
    const parsedMax = Math.max(parsedMin, Number(max) || parsedMin);
    onApply({ type: "budget", min: parsedMin, max: parsedMax });
    onClose();
    Keyboard.dismiss();
  };

  const clearCustomBudget = () => {
    setMin("");
    setMax("");
    onApply({ type: "budget", min: 0, max: Infinity });
  };

  return (
    <View style={styles.overlay}>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={() => {
          setExpanded(null);
          onClose();
        }}
      />

      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Text style={[styles.headerText, { color: theme.colors.text }]}>
          Filter
        </Text>

        {/* ================= BUDGET ================= */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setExpanded(expanded === "budget" ? null : "budget")}
          style={[
            styles.row,
            hasBudgetSelected && {
              backgroundColor: theme.colors.primary + "15",
              borderRadius: 10,
            },
          ]}
        >
          <View style={styles.left}>
            <Ionicons
              name="cash-outline"
              size={18}
              color={
                hasBudgetSelected ? theme.colors.primary : theme.colors.text
              }
            />
            <Text
              style={[
                styles.rowText,
                {
                  color: hasBudgetSelected
                    ? theme.colors.primary
                    : theme.colors.text,
                },
              ]}
            >
              Budget
            </Text>
          </View>

          <Ionicons
            name={expanded === "budget" ? "chevron-up" : "chevron-down"}
            size={18}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>

        {expanded === "budget" && (
          <View style={styles.expanded}>
            <Text style={[styles.subTitle, { color: theme.colors.text }]}>
              Quick ranges
            </Text>

            <View style={styles.presets}>
              {presets.map((p) => {
                const selected = isPresetSelected(p);

                return (
                  <TouchableOpacity
                    key={p.label}
                    style={[
                      styles.presetBtn,
                      {
                        borderColor: selected
                          ? theme.colors.primary
                          : theme.colors.border,
                        backgroundColor: selected
                          ? theme.colors.primary + "15"
                          : "transparent",
                      },
                    ]}
                    onPress={() => applyPreset(p)}
                  >
                    <Text
                      style={{
                        fontWeight: "700",
                        color: selected
                          ? theme.colors.primary
                          : theme.colors.text,
                      }}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ===== Custom range header + Clear ===== */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 10,
              }}
            >
              <Text style={[styles.subTitle, { color: theme.colors.text }]}>
                Custom range
              </Text>

              {hasBudgetSelected && (
                <TouchableOpacity onPress={clearCustomBudget}>
                  <Text
                    style={{
                      color: theme.colors.primary,
                      fontWeight: "700",
                      fontSize: 13,
                    }}
                  >
                    Clear
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.customRow}>
              <TextInput
                value={min}
                onChangeText={setMin}
                keyboardType="numeric"
                placeholder="Min"
                placeholderTextColor={theme.colors.textSecondary}
                style={[
                  styles.input,
                  {
                    color: theme.colors.text,
                    borderColor:
                      min !== "" ? theme.colors.primary : theme.colors.border,
                  },
                ]}
              />
              <Text style={{ marginHorizontal: 8, color: theme.colors.text }}>
                —
              </Text>
              <TextInput
                value={max}
                onChangeText={setMax}
                keyboardType="numeric"
                placeholder="Max"
                placeholderTextColor={theme.colors.textSecondary}
                style={[
                  styles.input,
                  {
                    color: theme.colors.text,
                    borderColor:
                      max !== "" ? theme.colors.primary : theme.colors.border,
                  },
                ]}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.applyBtn,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={applyCustomBudget}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                Apply Budget
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[styles.closeBtn, { backgroundColor: theme.colors.primary }]}
          onPress={() => {
            setExpanded(null);
            onClose();
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 999,
  },
  backdrop: { flex: 1 },
  container: {
    position: "absolute",
    right: 16,
    top: Platform.OS === "ios" ? 90 : 84,
    width: 320,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    elevation: 8,
  },
  headerText: { fontSize: 14, fontWeight: "800", marginBottom: 6 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  left: { flexDirection: "row", alignItems: "center" },
  rowText: { marginLeft: 8, fontSize: 15, fontWeight: "700" },

  expanded: {
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    marginTop: 6,
  },
  subTitle: { fontSize: 13, fontWeight: "700", marginBottom: 8 },
  presets: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginRight: 8,
    borderWidth: 1,
  },
  customRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  applyBtn: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  closeBtn: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
});
