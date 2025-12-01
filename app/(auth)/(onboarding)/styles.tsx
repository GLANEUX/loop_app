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
  const [error, setError] = useState<string | null>(null);

  const toggle = (label: string) => {
    setSelected((prev) => {
      const exists = prev.includes(label);
      const next = exists ? prev.filter((s) => s !== label) : [...prev, label];

      if (error && next.length > 0) {
        setError(null); // on efface l'erreur dès qu'au moins un style est sélectionné
      }

      return next;
    });
  };

  const handleContinue = () => {
    if (!selected.length) {
      setError("Sélectionne au moins un style pour continuer.");
      return;
    }

    console.log("Styles sélectionnés :", selected);
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

        {error && <Text style={styles.errorText}>{error}</Text>}
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
    gap: 8,
    marginBottom: 24,
  },
  errorText: {
    width: "100%",
    marginTop: 10,
    ...Typography.smallLight,
    color: Palette.primary,
    textAlign: "center",
  },
  buttonWrapper: {
    marginTop: 8,
  },
});

export default StylesScreen;
