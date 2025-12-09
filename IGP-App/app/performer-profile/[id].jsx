import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors from "../../src/constants/Colors";
import api from "../../src/api/api.js";

export default function PerformerProfileView() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["performer", id],
    queryFn: async () => (await api.get(`/performers/${id}`)).data,
  });

  if (isLoading || !data)
    return (
      <View style={styles.loading}>
        <Text>Loading...</Text>
      </View>
    );

  const perf = data.data;

  return (
    <View style={styles.container}>
      <Image source={{ uri: perf.image }} style={styles.banner} />

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{perf.user.name}</Text>
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={14} color="#FF9800" />
            <Text style={styles.ratingText}>
              {perf.rating} ({perf.reviewCount})
            </Text>
          </View>
        </View>

        <Text style={styles.category}>{perf.category}</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>{perf.bio}</Text>

        <Text style={styles.sectionTitle}>Starting From</Text>
        <Text style={styles.price}>
          ₹{perf.priceStartingAt.toLocaleString()}
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => Alert.alert("Booking", "Booking flow starts here.")}
        >
          <Text style={styles.bookBtnText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  banner: { width: "100%", height: 300, position: "absolute" },
  safeArea: { marginHorizontal: 20 },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    marginTop: 240,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    paddingBottom: 100,
    minHeight: 600,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  title: { fontSize: 26, fontWeight: "bold", color: Colors.textPrimary },
  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FF9800",
    marginLeft: 4,
  },
  category: { fontSize: 16, color: Colors.textSecondary, marginBottom: 15 },
  divider: { height: 1, backgroundColor: "#F0F0F0", marginVertical: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: Colors.textPrimary,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  price: { fontSize: 22, fontWeight: "bold", color: Colors.primary },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  bookBtn: {
    backgroundColor: Colors.secondary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  bookBtnText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
});
