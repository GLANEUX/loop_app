// src/screens/onboarding/PhoneStepScreen.tsx
import { OnboardingLayout } from "@/components/layout";
import { ButtonLoop } from "@/components/ui";
import { Palette, Typography } from "@/constants/theme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

export const PhoneStepScreen: React.FC = () => {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const countryLabel = "France";
  const countryPrefix = "+33";

  const handleContinue = () => {
    if (!phone.trim()) return;
    router.push("/(onboarding)/sms-code");
  };

  return (
    <OnboardingLayout
      imageSource={require("@/assets/images/auth/background-5.png")}
      progress={0.3}
      onBack={() => router.back()}
    >
      <Text style={styles.title}>Complète ton profil</Text>
      <Text style={styles.subtitle}>
        Choisis ton pays de résidence et entre ton numéro de téléphone.
      </Text>

      {/* Pays (simplifié, statique France pour l’instant) */}
      <View style={styles.countryRow}>
        <Text style={styles.flag}>🇫🇷</Text>
        <Text style={styles.countryText}>{countryLabel}</Text>
      </View>

      <View style={styles.separator} />

      {/* Téléphone */}
      <View style={styles.phoneRow}>
        <Text style={styles.prefix}>{countryPrefix}</Text>
        <View style={styles.prefixSeparator} />
        <TextInput
          style={styles.phoneInput}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          placeholder="0 00 00 00 00"
          placeholderTextColor="rgba(255,255,255,0.7)"
        />
      </View>

      <View style={styles.separator} />

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
  countryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  flag: {
    fontSize: 26,
    marginRight: 10,
  },
  countryText: {
    ...Typography.title3Bold,
    color: Palette.bgWhite,
  },
  separator: {
    height: 2,
    backgroundColor: "rgba(255,255,255,0.7)",
    marginBottom: 22,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  prefix: {
    ...Typography.title3Bold,
    color: Palette.bgWhite,
  },
  prefixSeparator: {
    width: 1,
    height: 26,
    backgroundColor: "rgba(255,255,255,0.5)",
    marginHorizontal: 10,
  },
  phoneInput: {
    flex: 1,
    ...Typography.title3Bold,
    color: Palette.bgWhite,
  },
  buttonWrapper: {
    marginTop: 32,
  },
});

export default PhoneStepScreen;
