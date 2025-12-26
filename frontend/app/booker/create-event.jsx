import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native";
import { useTheme } from "../../src/context/ThemeContext";
import BookerCreateEventForm from "../../src/components/booker/events/BookerCreateEventForm";
import { useLocalSearchParams } from "expo-router";

export default function CreateEventScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <BookerCreateEventForm hireContext={params} />
      </ScrollView>
    </SafeAreaView>
  );
}
