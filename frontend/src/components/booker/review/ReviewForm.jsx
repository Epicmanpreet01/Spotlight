import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../context/ThemeContext";

export default function ReviewForm({ onSubmit, loading }) {
  const { theme } = useTheme();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Rate Performer
      </Text>

      {/* ⭐ STAR RATING */}
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((i) => (
          <TouchableOpacity key={i} onPress={() => setRating(i)}>
            <Ionicons
              name={i <= rating ? "star" : "star-outline"}
              size={30}
              color="#FFC107"
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* COMMENT */}
      <TextInput
        placeholder="Write a review (optional)"
        value={comment}
        onChangeText={setComment}
        multiline
        style={[
          styles.input,
          { color: theme.colors.text, borderColor: theme.colors.border },
        ]}
        placeholderTextColor={theme.colors.textSecondary}
      />

      {/* SUBMIT */}
      <TouchableOpacity
        style={[
          styles.btn,
          { backgroundColor: theme.colors.primary, opacity: rating ? 1 : 0.5 },
        ]}
        disabled={!rating || loading}
        onPress={() => onSubmit({ rating, comment })}
      >
        <Text style={styles.btnText}>
          {loading ? "Submitting..." : "Submit Review"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, padding: 16, marginBottom: 16 },
  title: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  stars: { flexDirection: "row", gap: 6, marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    minHeight: 80,
    marginBottom: 12,
  },
  btn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
