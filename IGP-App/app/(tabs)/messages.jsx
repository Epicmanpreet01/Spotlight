import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../src/constants/Colors";

export default function MessagesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>
      <View style={styles.content}>
        <Ionicons name="chatbubbles-outline" size={60} color={Colors.neutral} />
        <Text style={styles.text}>No chats yet</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 20, borderBottomWidth: 1, borderColor: "#F5F5F5" },
  title: { fontSize: 28, fontWeight: "bold", color: Colors.textPrimary },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { marginTop: 10, color: Colors.textSecondary },
});
