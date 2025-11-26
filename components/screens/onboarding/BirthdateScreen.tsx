// src/screens/onboarding/BirthdateScreen.tsx
import { OnboardingLayout } from "@/components/layout";
import { ButtonLoop } from "@/components/ui";
import { Palette, Typography } from "@/constants/theme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

export const BirthdateScreen: React.FC = () => {
  const router = useRouter();
  const [birthdate, setBirthdate] = useState("");

  const handleChange = (value: string) => {
    // petit formatage JJ/MM/AAAA très simple
    const digits = value.replaceAll(/[^\d]/g, "").slice(0, 8);
    let result = digits;
    if (digits.length > 4) {
      result = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    } else if (digits.length > 2) {
      result = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    setBirthdate(result);
  };

  const handleContinue = () => {
    if (birthdate.length < 10) return;
    router.push("/(onboarding)/gender");
  };

  return (
    <OnboardingLayout
      imageSource={require("@/assets/images/auth/background-4.png")}
      progress={0.5}
      onBack={() => router.back()}
    >
      <Text style={styles.title}>Ta date de naissance</Text>
      <Text style={styles.subtitle}>
        Tu dois avoir au moins 18 ans pour rejoindre Loop.
      </Text>

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          placeholder="JJ/MM/AAAA"
          placeholderTextColor="rgba(255,255,255,0.6)"
          value={birthdate}
          onChangeText={handleChange}
        />
        <View style={styles.underline} />
      </View>

      <Text style={styles.reminder}>
        Tu dois avoir au moins 18 ans pour rejoindre la plateforme
      </Text>

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
    marginBottom: 32,
  },
  inputWrapper: {
    marginBottom: 12,
  },
  input: {
    ...Typography.title2Bold,
    color: Palette.bgWhite,
    letterSpacing: 4,
  },
  underline: {
    height: 2,
    backgroundColor: Palette.bgWhite,
    marginTop: 4,
  },
  reminder: {
    ...Typography.bodyRegular,
    color: Palette.bgWhite,
    marginBottom: 32,
  },
  buttonWrapper: {
    marginTop: 8,
  },
});

export default BirthdateScreen;
