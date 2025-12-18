import React from "react";
import { FlatList } from "react-native";
import { useRouter } from "expo-router";
import BookerPerformerCard from "./BookerPerformerCard";

export default function BookerNearbyList({ performers = [] }) {
  const router = useRouter();

  return (
    <FlatList
      horizontal
      data={performers}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <BookerPerformerCard
          performer={item}
          onPress={() => router.push(`/performer-profile/${item._id}`)}
        />
      )}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingBottom: 20,
      }}
    />
  );
}
