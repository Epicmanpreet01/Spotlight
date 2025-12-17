import React from "react";
import { TouchableOpacity, Image, View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../../context/ThemeContext";
import { IMAGES } from "../../../constants/images";

export default function BookerPerformerCard({ item }) {
  const router = useRouter();
  const { theme } = useTheme();

  const image = item.user?.profileImage || item.galleryImages?.[0];

  const imageSource = image ? { uri: image } : IMAGES.NO_IMAGE;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.card }]}
      onPress={() => router.push(`/performer-profile/${item._id}`)}
    >
      <Image source={imageSource} style={styles.cardImage} />

      <View style={styles.cardContent}>
        <View style={styles.row}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            {item.user?.name}
          </Text>
          <Text style={[styles.cardPrice, { color: theme.colors.primary }]}>
            ₹{item.priceStartingAt}
          </Text>
        </View>

        <Text style={[styles.cardSub, { color: theme.colors.textSecondary }]}>
          {item.category} •{" "}
          {item.user?.city || item.location?.city || "Location"}
        </Text>

        <Text
          style={[styles.cardDate, { color: theme.colors.textSecondary }]}
          numberOfLines={1}
        >
          {item.bio || "No bio available"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
  },
  cardImage: { width: "100%", height: 160 },
  cardContent: { padding: 15 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  cardPrice: { fontSize: 14, fontWeight: "700" },
  cardSub: { fontSize: 14, marginTop: 6 },
  cardDate: { fontSize: 12, marginTop: 4 },
});
