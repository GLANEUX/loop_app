// src/screens/onboarding/GenderScreen.tsx
import { OnboardingLayout, TagChip } from "@/components/layout";
import { ButtonLoop } from "@/components/ui";
import { Palette, Typography } from "@/constants/theme";
import { formatApiError } from "@/lib/api";
import { getAccessToken } from "@/lib/session";
import { updateMyProfile } from "@/lib/user";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const GENDERS = ["Femme", "Homme", "Non-binaire"] as const;

export const GenderScreen: React.FC = () => {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = (gender: string) => {
    setSelected(gender);
    if (error) setError(null); // effacer l’erreur dès qu’on choisit
  };

  const handleContinue = async () => {
    if (!selected) {
      setError("Sélectionne une option pour continuer.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        setError("Tu dois être connecté pour continuer.");
        return;
      }

      await updateMyProfile({ gender: selected }, token);
      router.push("/(onboarding)/styles");
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout
      imageSource={require("@/assets/images/auth/background-2.png")}
      progress={0.5}
      onBack={() => router.back()}
    >
      <Text style={styles.title}>Tu es un.e...</Text>

      <View style={styles.options}>
        {GENDERS.map((g) => (
          <TagChip
            key={g}
            label={g.toUpperCase()}
            selected={selected === g}
            onPress={() => handleSelect(g)}
          />
        ))}

        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      <View style={styles.buttonWrapper}>
        <ButtonLoop label="Continuer" onPress={handleContinue} loading={loading} />
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
    gap: 12,
  },
  errorText: {
    marginTop: 10,
    ...Typography.smallLight,
    color: Palette.primary,
    textAlign: "center",
  },
  buttonWrapper: {
    marginTop: 8,
  },
});

export default GenderScreen;
