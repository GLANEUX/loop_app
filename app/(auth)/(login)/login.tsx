// app/(auth)/(login)/login.tsx
import OpenEyeIcon from "@/assets/icons/icons/eye-1.svg";
import KeyIcon from "@/assets/icons/icons/group-1539-1.svg";
import CloseEyeIcon from "@/assets/icons/icons/hide-white.svg";
import MailIcon from "@/assets/icons/icons/mail-outline-white.svg";

import { ButtonLoop, SocialAuthSection } from "@/components/ui";
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
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const LoginScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = () => {
    if (!email || !password) {
      setError("L’adresse e-mail ou le mot de passe est incorrect.");
      return;
    }
    setError(null);
    router.replace("/(tabs)/explore");
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
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 },
        ]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.container}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome back ! 👋</Text>
            <Text style={styles.subtitle}>Heureux de te revoir</Text>
          </View>

          {/* CARD OPAQUE */}
          <View style={styles.card}>
            <AuthTextField
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              placeholder="Entrez votre e-mail"
              keyboardType="email-address"
              autoCapitalize="none"
              LeftIcon={MailIcon}
              error={error}
            />

            <AuthTextField
              label="Mot de passe"
              value={password}
              onChangeText={setPassword}
              placeholder="Entrez votre mot de passe"
              secureTextEntry={secure}
              autoCapitalize="none"
              LeftIcon={KeyIcon}
              RightIcon={secure ? CloseEyeIcon : OpenEyeIcon}
              onToggleSecure={() => setSecure((prev) => !prev)}
              error={error}
            />

            <TouchableOpacity
              onPress={() => router.push("/(auth)/(login)/forgot-password")}
            >
              <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            <ButtonLoop
              label="Connexion"
              variant="primary"
              onPress={handleLogin}
              style={{ marginTop: 16 }}
            />

            <SocialAuthSection onSelect={() => {}} />

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Pas de compte ? </Text>
              <TouchableOpacity
                onPress={() => router.push("/(auth)/(signup)/signup")}
              >
                <Text style={styles.registerLink}>S’inscrire</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },

  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },

  container: { flex: 1 },

  /* HEADER */
  header: {
    marginTop: 32,
    marginBottom: 5,
  },
  title: {
    ...Typography.title1Bold,
    color: Palette.bgWhite,
  },
  subtitle: {
    ...Typography.bodyRegular,
    color: Palette.bgWhite,
    marginTop: 4,
  },

  /* CARD + OPACITY */
  card: {
    marginTop: 20,
    borderRadius: 40,
    backgroundColor: Palette.opacityBackground,
    paddingVertical: 24,
    paddingHorizontal: 20,
    gap: 14,
  },

  forgotText: {
    ...Typography.bodyRegular,
    color: Palette.bgWhite,
    textDecorationLine: "underline",
  },

  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 18,
  },
  registerText: {
    ...Typography.bodyRegular,
    color: Palette.bgWhite,
  },
  registerLink: {
    ...Typography.bodyBold,
    color: Palette.primary,
  },
});

export default LoginScreen;
