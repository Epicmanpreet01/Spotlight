import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../../../context/ThemeContext";
import { addBookerEvent } from "../../../store/bookerEvents.store";

export default function BookerCreateEventForm() {
  const router = useRouter();
  const { theme } = useTheme();

  const [image, setImage] = useState(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [time, setTime] = useState("");
  const [desc, setDesc] = useState("");
  const [budget, setBudget] = useState("");

  const handleCreate = () => {
    if (!title || !type || !location || !time || !desc || !budget) {
      Alert.alert("Missing fields", "Please fill all details");
      return;
    }

    addBookerEvent({
      image,
      title,
      type,
      location,
      time,
      description: desc,
      budget,
    });

    router.back();
  };

  return (
    <View>
      {/* IMAGE PICKER */}
      <TouchableOpacity
        style={[styles.imageBox, { backgroundColor: theme.colors.card }]}
        onPress={() =>
          setImage(
            "https://images.unsplash.com/photo-1521737604893-d14cc237f11d"
          )
        }
      >
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <>
            <Ionicons
              name="image-outline"
              size={36}
              color={theme.colors.textSecondary}
            />
            <Text
              style={[styles.imageText, { color: theme.colors.textSecondary }]}
            >
              Add Event Image
            </Text>
          </>
        )}
      </TouchableOpacity>

      <Input label="Event Name" value={title} setValue={setTitle} />
      <Input label="Performer Type" value={type} setValue={setType} />
      <Input label="Location" value={location} setValue={setLocation} />
      <Input label="Event Time" value={time} setValue={setTime} />
      <Input label="Description" value={desc} setValue={setDesc} multiline />
      <Input
        label="Budget (₹)"
        value={budget}
        setValue={setBudget}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
        <Text style={styles.createText}>Create Event</Text>
      </TouchableOpacity>
    </View>
  );
}

function Input({ label, value, setValue, multiline, keyboardType }) {
  const { theme } = useTheme();

  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>

      <TextInput
        value={value}
        onChangeText={setValue}
        multiline={multiline}
        keyboardType={keyboardType}
        placeholderTextColor={theme.colors.textSecondary}
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.inputBg,
            color: theme.colors.text,
            borderColor: theme.colors.border,
          },
          multiline && { height: 90 },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  imageBox: {
    height: 180,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  image: { width: "100%", height: "100%", borderRadius: 14 },
  imageText: { marginTop: 8 },

  label: { fontWeight: "600", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },

  createBtn: {
    marginTop: 20,
    backgroundColor: "#00BCD4",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  createText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
});
