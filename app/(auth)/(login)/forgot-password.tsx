// app/forgot-password.tsx
import BackIcon from "@/assets/icons/icons/direction-right-2-outline-white.svg";
import MailIcon from "@/assets/icons/icons/mail-outline-white.svg";

import { ButtonLoop, IconButton } from "@/components/ui";
import { AuthTextField } from "@/components/ui/input/AuthTextField";
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

const ForgotPasswordScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSendCode = () => {
    if (!email.trim()) {
      setError("Merci d’indiquer ton adresse e-mail.");
      return;
    }

    setError(null);
    console.log("Send reset code to:", email);

    router.push("/verify-code");
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
          <View style={styles.topBar}>
            <IconButton
              icon={BackIcon}
              onPress={() => router.back()}
              style={{ transform: [{ scaleX: -1 }] }}
            />
          </View>

          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Mot de passe oublié ?</Text>
            <Text style={styles.subtitle}>
              Entre ton adresse mail associée à ton{"\n"}compte.
            </Text>
          </View>

          {/* CARD */}
          <View style={styles.card}>
            {error && <Text style={styles.errorText}>{error}</Text>}

            <AuthTextField
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              placeholder="johndoe@gmail.com"
              keyboardType="email-address"
              autoCapitalize="none"
              LeftIcon={MailIcon}
              error={error}
            />

            <ButtonLoop
              label="Envoyer mon code"
              onPress={handleSendCode}
              style={{ marginTop: 16 }}
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
  topBar: {
    marginTop: 8,
    marginBottom: 12,
    alignItems: "flex-start",
  },

  /* HEADER */
  header: {
    marginTop: 8,
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
    backgroundColor: Palette.opacityBackground,
    paddingVertical: 24,
    paddingHorizontal: 20,
    gap: 16,
  },

  errorText: {
    ...Typography.bodyBold,
    color: Palette.primary,
    marginBottom: 4,
  },
});

export default ForgotPasswordScreen;
