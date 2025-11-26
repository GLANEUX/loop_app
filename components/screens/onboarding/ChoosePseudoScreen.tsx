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

  const handleContinue = () => {
    if (!pseudo.trim()) return;
    router.push("/(onboarding)/phone"); // adapte le chemin
  };

  return (
    <OnboardingLayout
      imageSource={require("@/assets/images/auth/background-7.png")}
      progress={0.15}
      onBack={() => router.back()}
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
          style={styles.pseudoInput}
          value={pseudo}
          onChangeText={setPseudo}
          placeholder="Ton pseudo"
          placeholderTextColor="rgba(255,255,255,0.7)"
          autoCapitalize="none"
        />
        <View style={styles.underline} />
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
    marginBottom: 12,
  },
  subtitle: {
    ...Typography.bodyRegular,
    color: Palette.bgWhite,
    marginBottom: 28,
  },
  subtitleMuted: {
    ...Typography.bodyRegular,
    color: "rgba(255,255,255,0.8)",
  },
  inputWrapper: {
    marginBottom: 32,
  },
  pseudoInput: {
    ...Typography.title2Bold,
    color: Palette.bgWhite,
  },
  underline: {
    height: 2,
    backgroundColor: "rgba(255,255,255,0.9)",
    marginTop: 4,
  },
  buttonWrapper: {
    marginTop: 20,
  },
});

export default ChoosePseudoScreen;
