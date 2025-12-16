import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../../../context/ThemeContext";

const BOOKER_GREEN = "#00970dff";

export default function BookerPerformerCard({ performer, onPress }) {
  const { theme } = useTheme();

  const image =
    performer.galleryImages?.[0] ||
    performer.user?.profileImage ||
    "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=900&q=80";

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.card }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Image source={{ uri: image }} style={styles.image} />

      <View style={styles.meta}>
        <Text style={[styles.name, { color: theme.colors.text }]}>
          {performer.user?.name}
        </Text>

        <Text style={[styles.category, { color: theme.colors.textSecondary }]}>
          {performer.category}
        </Text>

        <Text style={styles.price}>₹{performer.priceStartingAt}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    borderRadius: 16,
    marginRight: 15,
    overflow: "hidden",
    elevation: 3,
  },
  image: { width: "100%", height: 130 },
  meta: { padding: 12 },
  name: { fontWeight: "700", fontSize: 15 },
  category: { marginTop: 4, fontSize: 13 },
  price: { marginTop: 6, fontWeight: "800", color: BOOKER_GREEN },
});
