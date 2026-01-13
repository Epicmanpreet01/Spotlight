// app/(auth)/sign-in.jsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useSigninMutation } from "@/src/hooks/mutations/useAuthMutation.js";
import Toast from "react-native-toast-message";

import Colors from "../../src/constants/Colors.js";

export default function SignInScreen() {
  const router = useRouter();

  const [signinBody, setSigninBody] = useState({
    email: "",
    password: "",
  });

  const onChange = (field, value) => {
    setSigninBody((old) => ({
      ...old,
      [field]: value,
    }));
  };

  const { mutate: signinMuate, isPending: signinPending } = useSigninMutation();

  const handleLogin = ({ email, password }) => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Enter email & password",
      });
      return;
    }
    signinMuate({ email, password });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Welcome Back!</Text>
            <Text style={styles.headerSubtitle}>Sign in to continue</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={signinBody.email}
                onChangeText={(text) => onChange("email", text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                secureTextEntry
                value={signinBody.password}
                onChangeText={(text) => onChange("password", text)}
              />
            </View>

            <TouchableOpacity
              style={styles.mainButton}
              onPress={() => handleLogin(signinBody)}
              disabled={signinPending}
            >
              {signinPending ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.mainButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footerLinks}>
              <Text style={styles.footerText}>
                Don&apos;t have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/sign-up")}>
                <Text style={styles.linkText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: 25 },
  backButton: { marginBottom: 20 },
  header: { marginBottom: 40 },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 5,
    color: Colors.textPrimary,
  },
  headerSubtitle: { fontSize: 16, color: Colors.textSecondary },
  formContainer: { flex: 1 },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.inputBackground,
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  mainButton: {
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    backgroundColor: Colors.neutral,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  mainButtonText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  footerLinks: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
  },
  footerText: { color: Colors.textSecondary, fontSize: 15 },
  linkText: { fontWeight: "bold", fontSize: 15, color: Colors.neutral },
});
