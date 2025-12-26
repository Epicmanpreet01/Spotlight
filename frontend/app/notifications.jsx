import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useTheme } from "../src/context/ThemeContext";
import { useNotifications } from "../src/hooks/queries/useNotifications";
import {
  useMarkAllNotificationsRead,
  useDeleteAllNotifications,
} from "../src/hooks/mutations/useNotificationMutations";

export default function NotificationsScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const { data: notifications = [] } = useNotifications();
  const { mutate: markAllRead } = useMarkAllNotificationsRead();
  const { mutate: deleteAll } = useDeleteAllNotifications();

  /* ✅ MARK ALL AS READ ON OPEN */
  useEffect(() => {
    if (notifications.some((n) => !n.read)) {
      markAllRead();
    }
  }, []);

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

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="notifications-off-outline"
        size={48}
        color={theme.colors.textSecondary}
      />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        No notifications yet
      </Text>
      <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
        You’re all caught up. We’ll notify you when something happens.
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* HEADER */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Notifications
        </Text>

        {/* 🗑 DELETE ALL */}
        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              "Delete all notifications?",
              "This action cannot be undone.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => deleteAll(),
                },
              ]
            )
          }
        >
          <Ionicons
            name="trash-outline"
            size={22}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 20, flexGrow: 1 }}
        ListEmptyComponent={<EmptyState />}
      />
    </SafeAreaView>
  );
}

/* ===================== STYLES (UNCHANGED) ===================== */
const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    justifyContent: "space-between",
  },

  headerTitle: { fontSize: 20, fontWeight: "700" },

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

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 6,
  },
});
