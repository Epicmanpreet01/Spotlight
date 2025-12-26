import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../../../context/ThemeContext";
import { IMAGES } from "../../../constants/images";

const BOOKER_GREEN = "#00970dff";

export default function BookerPerformerCard({ performer, onPress }) {
  const { theme } = useTheme();

  const image =
    performer.user?.profileImage || performer.galleryImages?.[0] || null;

  const imageSource = image ? { uri: image } : IMAGES.NO_IMAGE;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.card }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Image source={imageSource} style={styles.image} />

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
