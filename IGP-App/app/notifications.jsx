import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";

import api from "../src/api/api";
import { useTheme } from "../src/context/ThemeContext";

export default function NotificationsScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (await api.get("/notifications")).data,
  });

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
      <View style={[styles.iconBox, { backgroundColor: theme.colors.inputBg }]}>
        <Ionicons name="notifications" size={22} color={theme.colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {item.title}
        </Text>
        <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
          {item.message}
        </Text>
        <Text style={[styles.time, { color: theme.colors.textSecondary }]}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Notifications
        </Text>
      </View>

      <FlatList
        data={data?.data || []}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 20 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: "700", marginLeft: 20 },
  card: {
    flexDirection: "row",
    padding: 15,
    borderRadius: 12,
    marginBottom: 14,
  },
  iconBox: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  title: { fontSize: 16, fontWeight: "700" },
  message: { fontSize: 14, marginTop: 4 },
  time: { fontSize: 12, marginTop: 6 },
});
