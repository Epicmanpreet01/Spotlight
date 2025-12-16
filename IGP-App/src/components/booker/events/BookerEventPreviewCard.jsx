import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useTheme } from "../../../context/ThemeContext";

export default function BookerEventPreviewCard({ event, onPress }) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.card, { backgroundColor: theme.colors.card }]}
    >
      <Image source={{ uri: event.image }} style={styles.banner} />

      <View style={styles.body}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {event.title}
        </Text>

        <View style={styles.row}>
          <Text style={styles.icon}>📍</Text>
          <Text style={{ color: theme.colors.textSecondary }}>
            {event.location.city}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.icon}>🕒</Text>
          <Text style={{ color: theme.colors.textSecondary }}>
            {new Date(event.eventDate.start).toLocaleDateString()} •{" "}
            {new Date(event.eventDate.start).getHours()}:00
          </Text>
        </View>

        <Text style={[styles.section, { color: theme.colors.text }]}>
          Description
        </Text>

        <Text style={{ color: theme.colors.textSecondary }}>
          {event.description}
        </Text>

        <Text style={styles.budget}>₹{event.budget}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
  },
  banner: {
    width: "100%",
    height: 180,
  },
  body: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  icon: {
    marginRight: 6,
  },
  section: {
    marginTop: 14,
    fontWeight: "700",
  },
  budget: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "800",
    color: "green",
  },
});
