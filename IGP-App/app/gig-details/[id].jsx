// app/gig-details/[id].jsx
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchGigById, applyToGig } from "../../src/api/gigs.api.js";
import { useLocalSearchParams } from "expo-router";

export default function GigDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { data, isLoading } = useQuery({
    queryKey: ["gig", id],
    queryFn: () => fetchGigById(id),
  });
  const [coverMessage, setCoverMessage] = useState("");

  const applyMut = useMutation({
    mutationFn: (msg) => applyToGig(id, { coverMessage: msg }),
    onSuccess: () => Alert.alert("Applied", "Application sent"),
  });

  if (isLoading)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );

  const gig = data?.data;

  return (
    <View style={{ flex: 1 }}>
      <Image
        source={{ uri: gig?.previewImage || gig?.image }}
        style={{ width: "100%", height: 260 }}
      />
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: "bold" }}>{gig?.title}</Text>
        <Text style={{ marginTop: 10 }}>{gig?.description}</Text>

        <Text style={{ marginTop: 12 }}>Cover message</Text>
        <TextInput
          value={coverMessage}
          onChangeText={setCoverMessage}
          placeholder="Write a short message"
          style={{
            backgroundColor: "#f5f5f5",
            padding: 12,
            marginTop: 8,
            borderRadius: 10,
          }}
        />

        <TouchableOpacity
          onPress={() => applyMut.mutate(coverMessage)}
          style={{
            marginTop: 12,
            backgroundColor: "#FF5722",
            padding: 12,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "#fff", textAlign: "center" }}>Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
