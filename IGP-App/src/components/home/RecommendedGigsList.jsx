// src/components/home/RecommendedGigsList.jsx
import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../context/ThemeContext";

export default function RecommendedGigsList({ items = [] }) {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <View style={{ paddingHorizontal: 20, gap: 15, paddingBottom: 40 }}>
      {items.map((item) => (
        <TouchableOpacity
          key={item._id}
          style={[styles.row, { backgroundColor: theme.colors.card }]}
          onPress={() => router.push(`/gig-details/${item._id}`)}
        >
          <Image source={{ uri: item.previewImage }} style={styles.thumb} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {item.title}
            </Text>
            <Text style={[styles.sub, { color: theme.colors.textSecondary }]}>
              {item.categoryRequired} • {item.location?.address || "Location"}
            </Text>
            <Text
              style={{
                marginTop: 6,
                color: theme.colors.primary,
                fontWeight: "700",
              }}
            >
              ₹{item.budget}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    padding: 10,
    borderRadius: 16,
    elevation: 2,
    overflow: "hidden",
    alignItems: "center",
  },
  thumb: { width: 70, height: 70, borderRadius: 12, marginRight: 15 },
  title: { fontSize: 16, fontWeight: "bold" },
  sub: { fontSize: 13, marginTop: 4 },
});
