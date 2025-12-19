import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "../../../src/context/ThemeContext";
import * as ImagePicker from "expo-image-picker";

import { useGigByIdQuery } from "../../../src/hooks/queries/useGigs";
import { useUpdateGigMutation } from "../../../src/hooks/mutations/useGigMutation";

import { PERFORMER_CATEGORIES } from "../../../src/constants/Categories";
import { searchLocation } from "../../../src/utils/locationSearch";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function EditEventScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();

  const { data: gigResp, isLoading } = useGigByIdQuery(id);
  const gig = gigResp?.data;

  const { mutate: updateGig, isLoading: updateGigLoading } =
    useUpdateGigMutation();

  /* ===================== STATE ===================== */
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [desc, setDesc] = useState("");
  const [budget, setBudget] = useState("");

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [locationQuery, setLocationQuery] = useState("");
  const [locationData, setLocationData] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const [showCategoryModal, setShowCategoryModal] = useState(false);

  /* ===================== PREFILL ===================== */
  useEffect(() => {
    if (!gig) return;

    setTitle(gig.title);
    setCategory(gig.categoryRequired);
    setDesc(gig.description);
    setBudget(String(gig.budget));
    setStartDate(new Date(gig.eventDate.start));
    setEndDate(new Date(gig.eventDate.end));
    setLocationQuery(gig.location.address);
    setLocationData(gig.location);
    setImage(gig.previewImage || null);
  }, [gig]);

  /* ===================== LOCATION SEARCH ===================== */
  useEffect(() => {
    if (!locationQuery || locationQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const t = setTimeout(async () => {
      setIsTyping(false);
      const res = await searchLocation(locationQuery);
      setSuggestions(res);
    }, 500);

    return () => clearTimeout(t);
  }, [locationQuery]);

  /* ===================== IMAGE PICK ===================== */
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Allow gallery access");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  /* ===================== UPDATE ===================== */
  const handleUpdate = () => {
    if (
      !title ||
      !category ||
      !desc ||
      !budget ||
      !startDate ||
      !endDate ||
      !locationQuery
    ) {
      Alert.alert("Missing fields", "Please fill all details");
      return;
    }

    if (!locationData?.coordinates) {
      Alert.alert("Location not found", "Select valid location");
      return;
    }

    const formData = new FormData();

    formData.append("title", title);
    formData.append("description", desc);
    formData.append("categoryRequired", category);
    formData.append("budget", Number(budget));
    formData.append("eventDate[start]", startDate.toISOString());
    formData.append("eventDate[end]", endDate.toISOString());
    formData.append("location[address]", locationQuery);
    formData.append("location[coordinates][0]", locationData.coordinates[0]);
    formData.append("location[coordinates][1]", locationData.coordinates[1]);

    if (image && image !== gig.previewImage) {
      formData.append("previewImage", {
        uri: image,
        name: "event.jpg",
        type: "image/jpeg",
      });
    }

    updateGig({ id, data: formData }, { onSuccess: () => router.back() });
  };

  if (isLoading || !gig) return null;

  /* ===================== UI ===================== */
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScrollView
        style={{ backgroundColor: theme.colors.background }}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 20, paddingBottom: 160 }}
      >
        {/* IMAGE */}
        <TouchableOpacity
          style={[styles.imageBox, { backgroundColor: theme.colors.card }]}
          onPress={pickImage}
        >
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <Ionicons
              name="image-outline"
              size={36}
              color={theme.colors.textSecondary}
            />
          )}
        </TouchableOpacity>

        <ThemedInput label="Event Name" value={title} setValue={setTitle} />

        {/* CATEGORY */}
        <TouchableOpacity
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.inputBg,
              borderColor: theme.colors.border,
            },
          ]}
          onPress={() => setShowCategoryModal(true)}
        >
          <Text
            style={{
              color: category ? theme.colors.text : theme.colors.textSecondary,
            }}
          >
            {category || "Select performer category"}
          </Text>
        </TouchableOpacity>

        {/* LOCATION */}
        <ThemedInput
          label="Location"
          value={locationQuery}
          setValue={(t) => {
            setLocationQuery(t);
            setIsTyping(true);
            setLocationData(null);
          }}
        />

        {suggestions.map((s) => (
          <TouchableOpacity
            key={s.place_id}
            style={{
              padding: 12,
              borderBottomWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.card,
            }}
            onPress={() => {
              setLocationQuery(s.display_name);
              setLocationData({
                type: "Point",
                coordinates: [Number(s.lon), Number(s.lat)],
              });
              setSuggestions([]);
            }}
          >
            <Text style={{ color: theme.colors.text }}>{s.display_name}</Text>
          </TouchableOpacity>
        ))}

        <DateField
          label="Start Date"
          value={startDate}
          onPress={() => setShowStartPicker(true)}
        />
        <DateField
          label="End Date"
          value={endDate}
          onPress={() => setShowEndPicker(true)}
        />

        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            onChange={(e, d) => {
              setShowStartPicker(false);
              if (d) setStartDate(d);
            }}
          />
        )}

        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            onChange={(e, d) => {
              setShowEndPicker(false);
              if (d) setEndDate(d);
            }}
          />
        )}

        <ThemedInput
          label="Description"
          value={desc}
          setValue={setDesc}
          multiline
        />
        <ThemedInput
          label="Budget (₹)"
          value={budget}
          setValue={setBudget}
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={[
            styles.createBtn,
            { backgroundColor: theme.colors.primary },
            updateGigLoading && { opacity: 0.7 },
          ]}
          onPress={handleUpdate}
          disabled={updateGigLoading}
        >
          {updateGigLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.createText}>Update Event</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* CATEGORY MODAL */}
      <Modal visible={showCategoryModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalCard, { backgroundColor: theme.colors.card }]}
          >
            {PERFORMER_CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={{
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderColor: theme.colors.border,
                }}
                onPress={() => {
                  setCategory(c);
                  setShowCategoryModal(false);
                }}
              >
                <Text style={{ color: theme.colors.text }}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

/* ===================== THEMED INPUT ===================== */
function ThemedInput({ label, value, setValue, multiline, keyboardType }) {
  const { theme } = useTheme();
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ color: theme.colors.text }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={setValue}
        multiline={multiline}
        keyboardType={keyboardType}
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

function DateField({ label, value, onPress }) {
  const { theme } = useTheme();
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ color: theme.colors.text }}>{label}</Text>
      <TouchableOpacity
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.inputBg,
            borderColor: theme.colors.border,
          },
        ]}
        onPress={onPress}
      >
        <Text
          style={{
            color: value ? theme.colors.text : theme.colors.textSecondary,
          }}
        >
          {value?.toDateString() || "Select date"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  imageBox: {
    height: 180,
    borderRadius: 14,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  image: { width: "100%", height: "100%", borderRadius: 14 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  createBtn: {
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  createText: { color: "#FFF", fontWeight: "700" },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalCard: {
    padding: 20,
    borderRadius: 16,
  },
});
