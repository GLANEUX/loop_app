// src/screens/onboarding/GenderScreen.tsx
import { OnboardingLayout, TagChip } from "@/components/layout";
import { ButtonLoop } from "@/components/ui";
import { Palette, Typography } from "@/constants/theme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const GENDERS = ["Femme", "Homme", "Non-binaire"] as const;

export const GenderScreen: React.FC = () => {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    router.push("/(onboarding)/styles");
  };

  return (
    <OnboardingLayout
      imageSource={require("@/assets/images/auth/background-2.png")}
      progress={0.6}
      onBack={() => router.back()}
    >
      <Text style={styles.title}>Tu es un.e...</Text>

      <View style={styles.options}>
        {GENDERS.map((g) => (
          <TagChip
            key={g}
            label={g.toUpperCase()}
            selected={selected === g}
            onPress={() => setSelected(g)}
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
    marginBottom: 32,
  },
  options: {
    marginBottom: 32,
  },
  buttonWrapper: {
    marginTop: 8,
  },
});

export default GenderScreen;
