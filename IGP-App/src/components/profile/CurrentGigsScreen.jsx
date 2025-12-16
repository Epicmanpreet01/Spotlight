// src/components/profile/CurrentGigsScreen.jsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Image,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function CurrentGigsScreen({ visible, onClose }) {
  const { theme } = useTheme();
  const router = useRouter();

  const { data } = useQuery({
    queryKey: ["current-gigs-performer"],
    queryFn: async () => (await api.get("/booker/events")).data,
  });

  const gigs = data?.data || [];

  return (
    <Modal visible={visible} animationType="slide">
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Current Gigs
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* GIG LIST */}
        <FlatList
          data={gigs}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.9}
              style={[styles.card, { backgroundColor: theme.colors.card }]}
              onPress={() => router.push(`/performer/gig-preview/${item._id}`)}
            >
              {/* IMAGE */}
              {item.image && (
                <Image source={{ uri: item.image }} style={styles.banner} />
              )}

              {/* CONTENT */}
              <View style={styles.body}>
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                  {item.title}
                </Text>

                {/* LOCATION */}
                <View style={styles.row}>
                  <Ionicons
                    name="location-outline"
                    size={16}
                    color={theme.colors.primary}
                  />
                  <Text
                    style={[styles.meta, { color: theme.colors.textSecondary }]}
                  >
                    {item.location.address}, {item.location.city}
                  </Text>
                </View>

                {/* DATE & TIME */}
                <View style={styles.row}>
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color={theme.colors.primary}
                  />
                  <Text
                    style={[styles.meta, { color: theme.colors.textSecondary }]}
                  >
                    {new Date(item.eventDate.start).toLocaleDateString()} •{" "}
                    {new Date(item.eventDate.start).getHours()}:00
                  </Text>
                </View>

                {/* DESCRIPTION */}
                <Text
                  style={[styles.desc, { color: theme.colors.textSecondary }]}
                  numberOfLines={2}
                >
                  {item.description}
                </Text>

                {/* BUDGET */}
                <Text style={styles.budget}>₹{item.budget}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text
              style={{
                textAlign: "center",
                color: theme.colors.textSecondary,
                marginTop: 40,
              }}
            >
              No current gigs
            </Text>
          }
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: { fontSize: 18, fontWeight: "700" },

  card: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: "hidden",
  },

  banner: {
    width: "100%",
    height: 180,
  },

  body: {
    padding: 16,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 6,
  },

  meta: {
    fontSize: 13,
  },

  desc: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
  },

  budget: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "800",
    color: "green",
  },
});
