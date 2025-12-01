import { ButtonLoop, VerificationCodeInput } from "@/components/ui";
import { Palette, Typography } from "@/constants/theme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const VerifyCodeScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleChangeCode = (value: string) => {
    setCode(value);
    if (error) setError(null);
  };

  const handleSubmit = () => {
    if (code.length !== 4) {
      setError("Le code doit contenir 4 chiffres.");
      return;
    }

    console.log("Code de vérification:", code);
    router.replace("/(auth)/(login)/new-password");
  };

  return (
    <ImageBackground
      source={require("@/assets/images/auth/login-landing.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <View
        style={[
          styles.safeArea,
          {
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 24,
          },
        ]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.container}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Vérifie tes e-mails.</Text>
            <Text style={styles.subtitle}>
              Entre le code de vérification reçu par e-mail.
            </Text>
          </View>

          {/* CARD */}
          <View style={styles.card}>
            {error && <Text style={styles.errorText}>{error}</Text>}

            <Text style={styles.label}>Code de vérification</Text>

            <VerificationCodeInput
              length={4}
              value={code}
              onChange={handleChangeCode}
              hasError={!!error}
            />

            <ButtonLoop
              label="Envoyer mon code"
              onPress={handleSubmit}
              style={{ marginTop: 24 }}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  container: {
    flex: 1,
    justifyContent: "flex-start",
  },

  /* HEADER */
  header: {
    marginTop: 32,
    marginBottom: 12,
  },
  title: {
    ...Typography.title1Bold,
    color: Palette.bgWhite,
  },
  subtitle: {
    ...Typography.bodyRegular,
    color: Palette.bgWhite,
    marginTop: 8,
  },

  /* CARD */
  card: {
    marginTop: 32,
    borderRadius: 40,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingVertical: 24,
    paddingHorizontal: 20,
    gap: 18,
  },

  errorText: {
    ...Typography.bodyBold,
    color: Palette.primary,
  },

  label: {
    ...Typography.bodyBold,
    color: Palette.bgWhite,
  },
});

export default VerifyCodeScreen;
