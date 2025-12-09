import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

import Colors from "../src/constants/Colors.js";
import api from "../src/api/api.js";

export default function NotificationsScreen() {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (await api.get("/notifications")).data,
  });

  const renderItem = ({ item }) => (
    <View style={[styles.card, !item.read && styles.unreadCard]}>
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: item.type === "gig_alert" ? "#FFF3E0" : "#E3F2FD",
          },
        ]}
      >
        <Ionicons
          name={item.type === "gig_alert" ? "musical-notes" : "notifications"}
          size={24}
          color={item.type === "gig_alert" ? Colors.primary : "#2196F3"}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      {!item.read && <View style={styles.dot} />}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <FlatList
        data={data?.data || []}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No new notifications</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 20,
    color: Colors.textPrimary,
  },
  card: {
    flexDirection: "row",
    padding: 15,
    marginBottom: 15,
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    alignItems: "center",
  },
  unreadCard: { backgroundColor: "#F5F5F5", borderColor: "#E0E0E0" },
  iconBox: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  title: { fontSize: 16, fontWeight: "bold", color: Colors.textPrimary },
  message: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  time: { fontSize: 12, color: Colors.textLight, marginTop: 8 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    marginLeft: 10,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    color: Colors.textSecondary,
  },
});
