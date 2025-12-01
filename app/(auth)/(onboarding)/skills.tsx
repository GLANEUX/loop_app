// src/screens/onboarding/SkillsScreen.tsx

import { OnboardingLayout, TagChip } from "@/components/layout";
import { ButtonLoop } from "@/components/ui";
import { Palette, Typography } from "@/constants/theme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const SKILLS = [
  "Chant",
  "Guitare acoustique",
  "Guitare électrique",
  "Basse",
  "Piano",
  "Synthétiseur",
  "Batterie",
  "Percussions",
  "Violon",
  "Saxophone",
  "Flûte",
  "Harmonica",
  "Accordéon",
  "Platines",
  "Beatbox",
  "MAO",
  "Mixage",
  "Composition",
  "Enregistrement",
  "Coaching",
  "Trompette",
  "Production",
];

export const SkillsScreen: React.FC = () => {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const toggle = (label: string) => {
    setSelected((prev) => {
      const exists = prev.includes(label);
      const next = exists ? prev.filter((s) => s !== label) : [...prev, label];

      if (error && next.length > 0) {
        setError(null); // on efface l'erreur dès qu'au moins une compétence est sélectionnée
      }

      return next;
    });
  };

  const handleContinue = () => {
    if (!selected.length) {
      setError("Sélectionne au moins une compétence pour continuer.");
      return;
    }

    console.log("Compétences sélectionnées :", selected);
    router.push("/(onboarding)/upload-tracks");
  };

  return (
    <OnboardingLayout
      imageSource={require("@/assets/images/auth/background-7.png")}
      progress={0.8}
      onBack={() => router.back()}
    >
      <Text style={styles.title}>Tes compétences</Text>
      <Text style={styles.subtitle}>Guitare, batterie, synthé, voix…</Text>

      <View style={styles.tagsContainer}>
        {SKILLS.map((s) => (
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

export default SkillsScreen;
