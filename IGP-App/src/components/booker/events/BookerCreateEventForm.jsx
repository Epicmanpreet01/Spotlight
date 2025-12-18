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
import { useRouter } from "expo-router";
import { useTheme } from "../../../context/ThemeContext";
import * as ImagePicker from "expo-image-picker";

/* ===================== HOOK ===================== */
import { useCreateGigMutation } from "../../../hooks/mutations/useGigMutation";

/* ===================== CONSTANTS ===================== */
import { PERFORMER_CATEGORIES } from "../../../constants/Categories";

/* ===================== UTILS ===================== */
import { searchLocation } from "../../../utils/locationSearch";

/* ===================== DATE PICKER ===================== */
import DateTimePicker from "@react-native-community/datetimepicker";

export default function BookerCreateEventForm({ hireContext }) {
  const router = useRouter();
  const { theme } = useTheme();

  const { mutate: createGig, status } = useCreateGigMutation();
  const isPending = status === "pending";

  /* ===================== FORM STATE ===================== */
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [desc, setDesc] = useState("");
  const [budget, setBudget] = useState("");

  /* ===================== DATE ===================== */
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  /* ===================== LOCATION ===================== */
  const [locationQuery, setLocationQuery] = useState("");
  const [locationData, setLocationData] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  /* ===================== MODALS ===================== */
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  /* ===================== LOCATION SEARCH (DEBOUNCED) ===================== */
  useEffect(() => {
    if (!locationQuery || locationQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsTyping(false);
      const results = await searchLocation(locationQuery);
      setSuggestions(results);
    }, 500);

    return () => clearTimeout(timeout);
  }, [locationQuery]);

  const pickImageFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Please allow gallery access to select an image"
      );
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

  /* ===================== CREATE ===================== */
  const handleCreate = () => {
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

    if (!locationData?.location?.coordinates) {
      Alert.alert(
        "Location not found",
        "Please select a valid location from the suggestions"
      );
      return;
    }

    const formData = new FormData();

    formData.append("title", title);
    formData.append("description", desc);
    formData.append("categoryRequired", category);
    formData.append("budget", Number(budget));

    formData.append("eventDate[start]", startDate.toISOString());
    formData.append("eventDate[end]", endDate.toISOString());

    formData.append("location[address]", locationData.address);
    formData.append(
      "location[coordinates][0]",
      locationData.location.coordinates[0]
    );
    formData.append(
      "location[coordinates][1]",
      locationData.location.coordinates[1]
    );

    if (image) {
      formData.append("previewImage", {
        uri: image,
        name: "event.jpg",
        type: "image/jpeg",
      });
    }

    createGig(formData, {
      onSuccess: () => router.back(),
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScrollView
        style={{ flex: 1 }}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 160,
          flexGrow: 1,
        }}
      >
        {/* ================= IMAGE PICKER ================= */}
        <TouchableOpacity
          style={[styles.imageBox, { backgroundColor: theme.colors.card }]}
          onPress={pickImageFromGallery}
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
                style={[
                  styles.imageText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Add Event Image
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Input label="Event Name" value={title} setValue={setTitle} />

        {/* ================= CATEGORY ================= */}
        <View style={{ marginBottom: 14 }}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Performer Type
          </Text>

          <TouchableOpacity
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.inputBg,
                borderColor: theme.colors.border,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              },
            ]}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text
              style={{
                color: category
                  ? theme.colors.text
                  : theme.colors.textSecondary,
              }}
            >
              {category || "Select performer category"}
            </Text>
            <Ionicons
              name="chevron-down"
              size={18}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* ================= LOCATION ================= */}
        <View style={{ marginBottom: 14 }}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Location
          </Text>

          <TextInput
            value={locationQuery}
            onChangeText={(text) => {
              setLocationQuery(text);
              setIsTyping(true);
              setLocationData(null);
            }}
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.inputBg,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
          />

          {suggestions.length > 0 && !isTyping && (
            <View
              style={{
                backgroundColor: theme.colors.card,
                borderRadius: 10,
                marginTop: 6,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              {suggestions.map((s) => (
                <TouchableOpacity
                  key={s.place_id}
                  style={{ padding: 12 }}
                  onPress={() => {
                    setLocationQuery(s.display_name);
                    setLocationData({
                      address: s.display_name,
                      location: {
                        type: "Point",
                        coordinates: [Number(s.lon), Number(s.lat)],
                      },
                    });
                    setSuggestions([]);
                  }}
                >
                  <Text style={{ color: theme.colors.text }}>
                    {s.display_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* ================= DATES ================= */}
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
            value={startDate || new Date()}
            mode="date"
            onChange={(e, d) => {
              setShowStartPicker(false);
              if (d) setStartDate(d);
            }}
          />
        )}

        {showEndPicker && (
          <DateTimePicker
            value={endDate || new Date()}
            mode="date"
            onChange={(e, d) => {
              setShowEndPicker(false);
              if (d) setEndDate(d);
            }}
          />
        )}

        <Input label="Description" value={desc} setValue={setDesc} multiline />
        <Input
          label="Budget (₹)"
          value={budget}
          setValue={setBudget}
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={[styles.createBtn, isPending && { opacity: 0.7 }]}
          onPress={handleCreate}
          disabled={isPending}
        >
          {isPending ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.createText}>Create Event</Text>
          )}
        </TouchableOpacity>

        {/* ================= CATEGORY MODAL ================= */}
        <Modal visible={showCategoryModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View
              style={[styles.modalCard, { backgroundColor: theme.colors.card }]}
            >
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Select Performer Category
              </Text>

              <ScrollView>
                {PERFORMER_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={styles.modalItem}
                    onPress={() => {
                      setCategory(cat);
                      setShowCategoryModal(false);
                    }}
                  >
                    <Text style={{ color: theme.colors.text }}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                onPress={() => setShowCategoryModal(false)}
                style={{ marginTop: 12 }}
              >
                <Text style={{ color: theme.colors.textSecondary }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ===================== REUSABLE ===================== */
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
      <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
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
          {value ? value.toDateString() : "Select date"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/* ===================== STYLES (UNCHANGED) ===================== */
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

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "85%",
    maxHeight: "70%",
    padding: 20,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
});
