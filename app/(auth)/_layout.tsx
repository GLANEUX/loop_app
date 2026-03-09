import { Palette } from "@/constants/theme";
import { Stack } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function AuthLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: Palette.bgBlack }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: Palette.bgBlack },
        }}
      >
        <Stack.Screen name="authPage" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="(login)" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="(signup)" options={{ animation: "slide_from_right" }} />
      </Stack>
    </View>
  );
}
