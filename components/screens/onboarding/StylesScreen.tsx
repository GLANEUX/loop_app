// src/screens/onboarding/StylesScreen.tsx

import { OnboardingLayout, TagChip } from "@/components/layout";
import { ButtonLoop } from "@/components/ui";
import { Palette, Typography } from "@/constants/theme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const STYLES = [
  "Rock",
  "Pop",
  "RnB",
  "Soul",
  "Funk",
  "Jazz",
  "Electro",
  "Techno",
  "Classique",
  "House",
  "Drum & bass",
  "Trance",
  "Chill",
  "Reggae",
  "Trap",
  "Punk",
  "Métal",
  "Latino",
  "K-pop",
  "Gospel",
  "Acoustique",
];

export const StylesScreen: React.FC = () => {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (label: string) => {
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  };

  const handleContinue = () => {
    if (!selected.length) return;
    router.push("/(onboarding)/skills");
  };

  return (
    <OnboardingLayout
      imageSource={require("@/assets/images/auth/background-3.png")}
      progress={0.7}
      onBack={() => router.back()}
    >
      <Text style={styles.title}>Tes styles</Text>
      <Text style={styles.subtitle}>Indique tes genres de prédilection.</Text>

      <View style={styles.tagsContainer}>
        {STYLES.map((s) => (
          <TagChip
            key={s}
            label={s}
            selected={selected.includes(s)}
            onPress={() => toggle(s)}
          />
        ))}
      </View>

      <View style={styles.buttonWrapper}>
        <ButtonLoop label="Continuer" onPress={handleContinue} />
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  title: {
    ...Typography.title1Bold,
    color: Palette.bgWhite,
    marginBottom: 6,
  },
  subtitle: {
    ...Typography.bodyRegular,
    color: Palette.bgWhite,
    marginBottom: 24,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 24,
  },
  buttonWrapper: {
    marginTop: 8,
  },
});

export default StylesScreen;
