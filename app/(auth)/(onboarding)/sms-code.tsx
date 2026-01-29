// src/screens/onboarding/SmsCodeStepScreen.tsx
import { OnboardingLayout } from "@/components/layout";
import { ButtonLoop } from "@/components/ui";
import { Palette, Typography } from "@/constants/theme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

// ⬇️ importe ton nouveau composant
import { VerificationCodeInput } from "@/components/ui/input/VerificationCodeInput";

export const SmsCodeStepScreen: React.FC = () => {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleChangeCode = (value: string) => {
    setCode(value);
    if (error) setError(null);
  };

  const handleContinue = () => {
    if (code.length < 4) {
      setError("Le code doit contenir 4 chiffres.");
      return;
    }

    setError(null);
    console.log("Code SMS saisi :", code);
    router.push("/(onboarding)/birthdate");
  };

  return (
    <OnboardingLayout
      imageSource={require("@/assets/images/auth/background-2.png")}
      progress={0.3}
    >
      <Text style={styles.title}>Entre le code de vérification</Text>
      <Text style={styles.subtitle}>
        On t’a envoyé un SMS avec un code d’activation sur ton numéro +33 XX XX
        XX XX.
      </Text>

      <View style={styles.codeWrapper}>
        <VerificationCodeInput
          length={4}
          value={code}
          onChange={handleChangeCode}
          hasError={!!error}
          autoFocus
        />

        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      <ButtonLoop
        label="Continuer"
        onPress={handleContinue}
        style={{ marginTop: 16 }}
      />

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
  codeWrapper: {
    marginBottom: 8,
  },
  errorText: {
    marginTop: 6,
    ...Typography.smallLight,
    color: Palette.primary,
    textAlign: "center",
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
