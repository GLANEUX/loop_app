// app/(auth)/(login)/login.tsx
import OpenEyeIcon from "@/assets/icons/icons/eye-1.svg";
import KeyIcon from "@/assets/icons/icons/group-1539-1.svg";
import CloseEyeIcon from "@/assets/icons/icons/hide-white.svg";
import MailIcon from "@/assets/icons/icons/mail-outline-white.svg";

import { ButtonLoop } from "@/components/ui";
import { AuthTextField } from "@/components/ui/input/AuthTextField";
import { Palette, Typography } from "@/constants/theme";
import { ApiRequestError } from "@/lib/api";
import { login } from "@/lib/auth";
import { saveSession } from "@/lib/session";
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
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("L’adresse e-mail ou le mot de passe est incorrect.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const session = await login({ email, password });
      await saveSession(session);
      router.replace("/(tabs)/explore");
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.status === 401 || err.status === 400) {
          setError("E-mail ou mot de passe invalide.");
          return;
        }
        if (err.status === 429) {
          setError("Trop de tentatives. Reessayez plus tard.");
          return;
        }
      }
      setError("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
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
            {error && <Text style={styles.errorText}>{error}</Text>}

            <AuthTextField
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              placeholder="Entrez votre e-mail"
              keyboardType="email-address"
              autoCapitalize="none"
              LeftIcon={MailIcon}
              error={error}
              showErrorText={false}
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
              showErrorText={false}
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
              loading={loading}
              style={{ marginTop: 16 }}
            />

            {/* <SocialAuthSection onSelect={() => {}} /> */}

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

  errorText: {
    color: Palette.primary,
    ...Typography.bodyBold,
    marginBottom: 4,
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
