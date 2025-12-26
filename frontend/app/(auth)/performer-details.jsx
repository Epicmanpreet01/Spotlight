// app/(auth)/performer-details.jsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { PERFORMER_CATEGORIES } from "../../src/constants/Categories.js";
import { useSignupMutation } from "@/src/hooks/mutations/useAuthMutation.js";
import Toast from "react-native-toast-message";

export default function PerformerDetailsScreen() {
  const params = useLocalSearchParams();
  const { name, email, password, role } = params;

  const [performerDetails, setPerformerDetails] = useState({
    category: "",
    price: "",
    performanceType: "",
  });

  const onChange = (field, value) => {
    setPerformerDetails((old) => ({
      ...old,
      [field]: value,
    }));
  };

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const { mutate: signupMutate, isPending: signupPending } =
    useSignupMutation();

  const handleFinish = ({ category, price, performanceType }) => {
    if (!category || !price || !performanceType) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Complete all fields",
      });
      return;
    }
    const payload = {
      name,
      email,
      password,
      role,
      category,
      priceStartingAt: Number(price),
      type: performanceType,
    };
    signupMutate(payload);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 26, fontWeight: "bold" }}>One Last Step!</Text>
        <Text>Set up your performer preferences</Text>

        <TouchableOpacity
          onPress={() => setIsCategoryModalOpen(true)}
          style={styles.selector}
        >
          <Text>{performerDetails.category || "Select Category"}</Text>
        </TouchableOpacity>

        <Text style={{ marginTop: 12 }}>Performance Type</Text>
        <View style={{ flexDirection: "row", marginTop: 8 }}>
          <TouchableOpacity
            onPress={() => onChange("performanceType", "solo")}
            style={[
              styles.typeBtn,
              performerDetails.performanceType === "solo" && {
                backgroundColor: "#FF5722",
              },
            ]}
          >
            <Text
              style={{
                color:
                  performerDetails.performanceType === "solo" ? "#fff" : "#000",
              }}
            >
              Solo
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onChange("performanceType", "group")}
            style={[
              styles.typeBtn,
              performerDetails.performanceType === "group" && {
                backgroundColor: "#FF5722",
              },
            ]}
          >
            <Text
              style={{
                color:
                  performerDetails.performanceType === "group"
                    ? "#fff"
                    : "#000",
              }}
            >
              Group
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={{ marginTop: 12 }}>Starting Price</Text>
        <TextInput
          keyboardType="numeric"
          value={performerDetails.price}
          onChangeText={(text) => onChange("price", text)}
          style={styles.input}
        />

        <TouchableOpacity
          onPress={() => handleFinish(performerDetails)}
          style={styles.button}
          disabled={signupPending}
        >
          {signupPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff" }}>Complete & Sign Up</Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal visible={isCategoryModalOpen} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{ backgroundColor: "#fff", padding: 20, maxHeight: "60%" }}
          >
            <FlatList
              data={PERFORMER_CATEGORIES}
              keyExtractor={(i) => i}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onChange("category", item);
                    setIsCategoryModalOpen(false);
                  }}
                  style={{ padding: 12 }}
                >
                  <Text>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  selector: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#f5f5f5",
  },
  typeBtn: {
    padding: 12,
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: "#eee",
  },
  input: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#FF5722",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
});
