// src/components/onboarding/OnboardingProgressBar.tsx
import { Palette } from "@/constants/theme";
import React from "react";
import { StyleSheet, View } from "react-native";

interface Props {
  progress: number; // 0 -> 1
}

export const OnboardingProgressBar: React.FC<Props> = ({ progress }) => {
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { flex: clamped }]} />
      <View style={{ flex: 1 - clamped }} />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    height: 5,
    borderRadius: 999,
    backgroundColor: "#E5E5E5",
    overflow: "hidden",
    flexDirection: "row",
  },
  fill: {
    backgroundColor: Palette.primary, // ton orange
  },
});

export default OnboardingProgressBar;
