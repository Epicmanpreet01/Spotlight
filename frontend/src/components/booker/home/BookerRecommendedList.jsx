import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../../context/ThemeContext";
import { IMAGES } from "../../../constants/images.js";

const BOOKER_GREEN = "#00970dff";

export default function BookerRecommendedList({ performers = [] }) {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <View style={{ paddingHorizontal: 20, paddingBottom: 40 }}>
      {performers.map((item) => (
        <TouchableOpacity
          key={item._id}
          style={[styles.row, { backgroundColor: theme.colors.card }]}
          onPress={() => router.push(`/performer-profile/${item._id}`)}
        >
          <Image
            source={
              item.user?.profileImage || item.galleryImages?.[0]
                ? { uri: item.user?.profileImage || item.galleryImages?.[0] }
                : IMAGES.NO_IMAGE
            }
            style={styles.thumb}
          />

          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {item.user?.name}
            </Text>
            <Text style={[styles.sub, { color: theme.colors.textSecondary }]}>
              {item.category} • {item.user?.city}
            </Text>
            <Text style={styles.price}>Starting ₹{item.priceStartingAt}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 16,
    marginBottom: 14,
    elevation: 2,
  },
  thumb: { width: 72, height: 72, borderRadius: 12, marginRight: 14 },
  title: { fontSize: 16, fontWeight: "700" },
  sub: { fontSize: 13, marginTop: 4 },
  price: { marginTop: 6, fontWeight: "700", color: BOOKER_GREEN },
});
