import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native";
import { useTheme } from "../../src/context/ThemeContext";
import BookerCreateEventForm from "../../src/components/booker/events/BookerCreateEventForm";

export default function CreateEventScreen() {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <BookerCreateEventForm />
      </ScrollView>
    </SafeAreaView>
  );
}
