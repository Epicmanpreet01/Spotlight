import React from "react";
import { TouchableOpacity, Image, View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../context/ThemeContext";
import { IMAGES } from "../../constants/images";

export default function GigCard({ item }) {
  const router = useRouter();
  const { theme } = useTheme();

  const image = item.previewImage;
  const imageSource = image ? { uri: image } : IMAGES.NO_IMAGE;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.card }]}
      onPress={() => router.push(`/gig-details/${item._id}`)}
    >
      <Image source={imageSource} style={styles.cardImage} />

      <View style={styles.cardContent}>
        <View style={styles.row}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            {item.title}
          </Text>
          <Text style={styles.cardPrice}>₹{item.budget}</Text>
        </View>

        <Text style={[styles.cardSub, { color: theme.colors.textSecondary }]}>
          {item.categoryRequired} • {item.location?.address || "Location"}
        </Text>

        <Text style={[styles.cardDate, { color: theme.colors.textSecondary }]}>
          {new Date(item.eventDate?.start).toDateString()}
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
  cardTitle: { fontSize: 16, fontWeight: "bold" },
  cardPrice: { fontSize: 16, fontWeight: "bold", color: "green" },
  cardSub: { fontSize: 14, marginTop: 5 },
  cardDate: { fontSize: 12, marginTop: 4 },
});
