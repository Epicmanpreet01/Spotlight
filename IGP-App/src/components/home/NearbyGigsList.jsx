// src/components/home/NearbyGigsList.jsx
import React from "react";
import {
  FlatList,
  TouchableOpacity,
  Image,
  View,
  Text,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../context/ThemeContext";

export default function NearbyGigsList({ items = [] }) {
  const router = useRouter();
  const { theme } = useTheme();

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.card }]}
      onPress={() => router.push(`/gig-details/${item._id}`)}
    >
      <Image source={{ uri: item.previewImage }} style={styles.img} />
      <View style={styles.meta}>
        <Text
          style={[styles.title, { color: theme.colors.text }]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text style={styles.price}>₹{item.budget}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      horizontal
      data={items}
      renderItem={renderItem}
      keyExtractor={(i) => i._id}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 10 }}
      showsHorizontalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    borderRadius: 16,
    marginRight: 15,
    padding: 10,
    elevation: 3,
    overflow: "hidden",
  },
  img: { width: "100%", height: 120, borderRadius: 12 },
  meta: { marginTop: 10 },
  title: { fontSize: 15, fontWeight: "bold" },
  price: { color: "green", fontWeight: "bold" },
});
