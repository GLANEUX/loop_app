// src/screens/onboarding/ChoosePseudoScreen.tsx
import { OnboardingLayout } from "@/components/layout";
import { ButtonLoop } from "@/components/ui";
import { Palette, Typography } from "@/constants/theme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

export const ChoosePseudoScreen: React.FC = () => {
  const router = useRouter();
  const [pseudo, setPseudo] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleChangePseudo = (value: string) => {
    setPseudo(value);
    if (error) setError(null);
  };

  const handleContinue = () => {
    if (!pseudo.trim()) {
      setError("Choisis un pseudo pour continuer.");
      return;
    }
    console.log("Pseudo choisi :", pseudo);

    router.push("/(onboarding)/phone");
  };

  return (
    <OnboardingLayout
      imageSource={require("@/assets/images/auth/background-7.png")}
      progress={0.15}
    >
      <Text style={styles.title}>Choisis ton pseudo</Text>

      <Text style={styles.subtitle}>
        Le nom sous lequel les autres musiciens vont te découvrir{"\n"}
        <Text style={styles.subtitleMuted}>
          Exemple : beatmaker_luna ou JazzFred
        </Text>
      </Text>

      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.pseudoInput, error && styles.pseudoInputError]}
          value={pseudo}
          onChangeText={handleChangePseudo}
          placeholder="Ton pseudo"
          placeholderTextColor={Palette.grey300}
          autoCapitalize="none"
        />
        <View style={[styles.underline, error && styles.underlineError]} />

        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      <View style={styles.buttonWrapper}>
        <ButtonLoop
          label="Continuer"
          onPress={handleContinue}
          // optionnel : désactiver tant que le champ est vide
          // disabled={!pseudo.trim()}
        />
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  title: {
    ...Typography.title1Bold,
    color: Palette.bgWhite,
    marginBottom: 12,
  },
  subtitle: {
    ...Typography.bodyRegular,
    color: Palette.bgWhite,
    marginBottom: 28,
  },
  subtitleMuted: {
    ...Typography.bodyRegular,
    color: Palette.grey100,
  },
  inputWrapper: {
    marginBottom: 32,
  },
  pseudoInput: {
    ...Typography.title2Bold,
    color: Palette.bgWhite,
  },
  pseudoInputError: {
    color: Palette.primary,
  },
  underline: {
    height: 2,
    backgroundColor: Palette.grey100,
    marginTop: 4,
  },
  underlineError: {
    backgroundColor: Palette.primary,
  },
  errorText: {
    marginTop: 6,
    ...Typography.smallLight,
    color: Palette.primary,
  },
  buttonWrapper: {
    marginTop: 20,
  },
});

export default ChoosePseudoScreen;
