// app/(onboarding)/_layout.tsx
import { Stack } from "expo-router";
import React from "react";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right", // animation fluide entre les étapes
        gestureEnabled: false, // empêche de skip avec le swipe-back sur iOS
      }}
    >
      <Stack.Screen name="name" />
      <Stack.Screen name="phone" />
      {/* <Stack.Screen name="sms-code" /> */}
      <Stack.Screen name="birthdate" />
      <Stack.Screen name="gender" />
      <Stack.Screen name="styles" />
      <Stack.Screen name="skills" />
      <Stack.Screen name="avatar" />
      <Stack.Screen name="bio" />
      {/* <Stack.Screen name="upload-tracks" /> */}
      {/* <Stack.Screen name="upload-success" /> */}
      <Stack.Screen name="welcome-rules" />
    </Stack>
  );
}
