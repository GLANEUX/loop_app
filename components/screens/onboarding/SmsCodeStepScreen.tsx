// src/screens/onboarding/SmsCodeStepScreen.tsx

import { CodeInput, OnboardingLayout } from "@/components/layout";
import { ButtonLoop } from "@/components/ui";
import { Palette, Typography } from "@/constants/theme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export const SmsCodeStepScreen: React.FC = () => {
  const router = useRouter();
  const [code, setCode] = useState("");

  const handleContinue = () => {
    if (code.length < 5) return;
    router.push("/(onboarding)/birthdate");
  };

  return (
    <OnboardingLayout
      imageSource={require("@/assets/images/auth/background-2.png")}
      progress={0.4}
      onBack={() => router.back()}
    >
      <Text style={styles.title}>Entre le code de vérification</Text>
      <Text style={styles.subtitle}>
        On t’a envoyé un SMS avec un code d’activation sur ton numéro +33 XX XX
        XX XX.
      </Text>

      <CodeInput length={5} value={code} onChange={setCode} />

      <ButtonLoop label="Continuer" onPress={handleContinue} />

      <View style={styles.resendRow}>
        <Text style={styles.resendText}>Renvoyer un code </Text>
        <Text style={styles.timerText}>00:20</Text>
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
    marginBottom: 10,
  },
  resendRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  resendText: {
    ...Typography.bodyBold,
    color: Palette.bgWhite,
  },
  timerText: {
    ...Typography.bodyBold,
    color: Palette.bgWhite,
  },
});

export default SmsCodeStepScreen;
