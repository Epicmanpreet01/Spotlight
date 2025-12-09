import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  LayoutAnimation,
  UIManager,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors from "../../src/constants/Colors";
import { useSignupMutation } from "../../src/hooks/mutations/useAuthMutation.js";
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Regex Patterns
const PASSWORD_REGEX = /^(?=.*[A-Za-z0-9]).{8,}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9.%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function SignUpScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(null);

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLearnMoreOpen, setIsLearnMoreOpen] = useState(false);

  const activeColor =
    role === "performer"
      ? Colors.primary
      : role === "booker"
      ? Colors.secondary
      : Colors.neutral;

  const signupMutation = useSignupMutation();

  const validateInputs = () => {
    let isValid = true;

    if (!EMAIL_REGEX.test(email)) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    } else setEmailError("");

    if (!PASSWORD_REGEX.test(password)) {
      setPasswordError("Minimum 8 characters required");
      isValid = false;
    } else setPasswordError("");

    return isValid;
  };

  const handleNextOrRegister = () => {
    if (!role || !email || !password || !name) {
      Alert.alert("Missing Fields", "Please fill all fields");
      return;
    }

    if (!validateInputs()) return;

    if (role === "performer") {
      router.push({
        pathname: "/(auth)/performer-details",
        params: {
          name,
          email,
          password,
          role,
        },
      });
      return;
    }

    const payload = {
      name,
      email,
      password,
      role: "booker",
    };

    signupMutation.mutate(payload, {
      onSuccess: () => {
        router.replace("/(tabs)/home");
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View
              style={[
                styles.headerIcon,
                {
                  backgroundColor: role
                    ? role === "performer"
                      ? "#FFF3E0"
                      : "#E0F7FA"
                    : "#ECEFF1",
                },
              ]}
            >
              <Ionicons
                name={
                  role === "performer"
                    ? "mic"
                    : role === "booker"
                    ? "search"
                    : "person-add"
                }
                size={32}
                color={activeColor}
              />
            </View>

            <Text style={[styles.headerTitle, { color: activeColor }]}>
              Create Account
            </Text>
            <Text style={styles.headerSubtitle}>
              Join the community of talents
            </Text>
          </View>

          {/* FORM */}
          <View style={styles.formContainer}>
            {/* NAME */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={[
                  styles.input,
                  { borderColor: role ? activeColor : Colors.border },
                ]}
                placeholder="John Doe"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* EMAIL */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: emailError
                      ? "red"
                      : role
                      ? activeColor
                      : Colors.border,
                  },
                ]}
                placeholder="john@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) setEmailError("");
                }}
              />
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}
            </View>

            {/* PASSWORD */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: passwordError
                      ? "red"
                      : role
                      ? activeColor
                      : Colors.border,
                  },
                ]}
                placeholder="Create a strong password"
                secureTextEntry
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordError) setPasswordError("");
                }}
              />
              <Text
                style={[styles.helperText, passwordError && { color: "red" }]}
              >
                {passwordError || "Minimum 8 characters required"}
              </Text>
            </View>

            {/* ROLE SELECTOR */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>I want to join as a...</Text>

              <View style={{ position: "relative" }}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    LayoutAnimation.configureNext(
                      LayoutAnimation.Presets.easeInEaseOut
                    );
                    setIsRoleDropdownOpen(!isRoleDropdownOpen);
                  }}
                  style={[
                    styles.selector,
                    {
                      borderColor: activeColor,
                      backgroundColor: role ? "#FFF" : "#FAFAFA",
                    },
                  ]}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons
                      name={
                        role === "performer"
                          ? "musical-notes"
                          : role === "booker"
                          ? "briefcase"
                          : "people-circle"
                      }
                      size={22}
                      color={activeColor}
                      style={{ marginRight: 10 }}
                    />

                    <Text
                      style={{
                        color: role ? Colors.textPrimary : Colors.textSecondary,
                        fontSize: 16,
                      }}
                    >
                      {role === "performer"
                        ? "Performer (Artist)"
                        : role === "booker"
                        ? "Booker (Organizer)"
                        : "Select Role"}
                    </Text>
                  </View>

                  <Ionicons
                    name={isRoleDropdownOpen ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>

                {isRoleDropdownOpen && (
                  <View style={styles.dropdownMenu}>
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setRole("performer");
                        setIsRoleDropdownOpen(false);
                      }}
                    >
                      <View
                        style={[styles.iconBox, { backgroundColor: "#FFF3E0" }]}
                      >
                        <Ionicons
                          name="musical-notes"
                          size={18}
                          color={Colors.primary}
                        />
                      </View>
                      <View>
                        <Text style={styles.dropdownTitle}>Performer</Text>
                        <Text style={styles.dropdownSub}>
                          Singer, Dancer, Band, etc.
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setRole("booker");
                        setIsRoleDropdownOpen(false);
                      }}
                    >
                      <View
                        style={[styles.iconBox, { backgroundColor: "#E0F7FA" }]}
                      >
                        <Ionicons
                          name="search"
                          size={18}
                          color={Colors.secondary}
                        />
                      </View>
                      <View>
                        <Text style={styles.dropdownTitle}>Booker</Text>
                        <Text style={styles.dropdownSub}>
                          Event Organizer, Club, User
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            {/* SUBMIT BUTTON */}
            <TouchableOpacity
              style={[styles.mainButton, { backgroundColor: activeColor }]}
              onPress={handleNextOrRegister}
              disabled={signupMutation.isPending}
            >
              {signupMutation.isPending ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.mainButtonText}>
                    {role === "performer" ? "Next" : "Sign Up"}
                  </Text>
                  {role === "performer" && (
                    <Ionicons
                      name="arrow-forward"
                      size={20}
                      color="#FFF"
                      style={{ marginLeft: 8 }}
                    />
                  )}
                </View>
              )}
            </TouchableOpacity>

            {/* Already have an account */}
            <View style={styles.footerLinks}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/sign-in")}>
                <Text style={[styles.linkText, { color: activeColor }]}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* LEARN MORE MODAL */}
        <Modal
          visible={isLearnMoreOpen}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setIsLearnMoreOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Why Location Matters?</Text>
                <TouchableOpacity onPress={() => setIsLearnMoreOpen(false)}>
                  <Ionicons
                    name="close-circle"
                    size={28}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.modalBody}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.modalSection}>
                  <Ionicons
                    name="map"
                    size={40}
                    color={activeColor}
                    style={{ marginBottom: 10 }}
                  />
                  <Text style={styles.modalSubtitle}>For Performers</Text>
                  <Text style={styles.modalText}>
                    We use your location to showcase your talent to organizers
                    within your city.
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.modalSection}>
                  <Ionicons
                    name="search"
                    size={40}
                    color={activeColor}
                    style={{ marginBottom: 10 }}
                  />
                  <Text style={styles.modalSubtitle}>For Bookers</Text>
                  <Text style={styles.modalText}>
                    Location helps us curate a list of talented artists near you
                    for reliable event planning.
                  </Text>
                </View>
              </ScrollView>

              <TouchableOpacity
                style={[
                  styles.mainButton,
                  { backgroundColor: activeColor, marginTop: 10 },
                ]}
                onPress={() => setIsLearnMoreOpen(false)}
              >
                <Text style={styles.mainButtonText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingVertical: 30, paddingHorizontal: 25 },
  header: { alignItems: "center", marginBottom: 30 },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  headerTitle: { fontSize: 28, fontWeight: "bold", marginBottom: 5 },
  headerSubtitle: { fontSize: 16, color: Colors.textSecondary },
  formContainer: { flex: 1 },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 2,
  },
  input: {
    backgroundColor: Colors.inputBackground,
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  selector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: Colors.inputBackground,
  },
  dropdownMenu: {
    position: "absolute", // <-- NEW
    top: "100%", // <-- NEW (right below selector)
    left: 0,
    right: 0,
    zIndex: 999, // <-- NEW (appear above everything)
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    elevation: 6,
    marginTop: 4, // reduced gap
  },

  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8, // reduced vertical spacing
    paddingHorizontal: 15,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  dropdownTitle: { fontSize: 16, fontWeight: "600", color: Colors.textPrimary },
  dropdownSub: { fontSize: 12, color: Colors.textSecondary },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    width: "100%",
    marginVertical: 15,
  },
  locationContainer: {
    flexDirection: "row",
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  locationInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  detectButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  detectText: { color: "#FFF", fontWeight: "600", marginLeft: 5 },
  helperText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 5,
    marginLeft: 2,
  },
  errorText: { fontSize: 12, color: "red", marginTop: 5, marginLeft: 2 },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginLeft: 2,
  },
  infoText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 5,
    marginRight: 5,
  },
  learnMoreText: {
    fontSize: 12,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    marginLeft: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.textSecondary,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxText: { fontSize: 13, color: Colors.textPrimary, flex: 1 },
  mainButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    elevation: 4,
  },
  mainButtonText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  modalContent: {
    width: "92%",
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 25,
    maxHeight: "80%",
    elevation: 10,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },

  modalBody: {
    maxHeight: 300,
    marginBottom: 10,
  },

  modalSection: {
    alignItems: "center",
    marginBottom: 20,
  },

  modalSubtitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 8,
  },

  modalText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  footerLinks: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
  },

  footerText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },

  linkText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
