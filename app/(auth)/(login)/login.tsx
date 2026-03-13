// app/login.tsx
import OpenEyeIcon from "@/assets/icons/icons/eye-1.svg";
import KeyIcon from "@/assets/icons/icons/group-1539-1.svg";
import CloseEyeIcon from "@/assets/icons/icons/hide-white.svg";
import MailIcon from "@/assets/icons/icons/mail-outline-white.svg";

import { ButtonLoop } from "@/components/ui";
import { AuthTextField } from "@/components/ui/input/AuthTextField";
import { Palette, Typography } from "@/constants/theme";
import { ApiRequestError } from "@/lib/api";
import { login } from "@/lib/auth";
import { getOnboardingEntry } from "@/lib/onboarding";
import { saveSession } from "@/lib/session";
import { getMyProfileCached } from "@/lib/user";
import { useAuth } from "@/lib/auth-context";
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
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const LoginScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();

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
      
      const me = await getMyProfileCached(session.accessToken, true);
      
      // Mettre à jour l'état global
      await signIn({ token: session.accessToken, user: session.user as any });

      // Redirection gérée par AuthContext
    } catch (err: any) {
      if (err?.name === "ApiRequestError") {
        const apiError = err as ApiRequestError;
        if (apiError.status === 401 || apiError.status === 400) {
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + 12,
              paddingBottom: insets.bottom + 24,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
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

            <ButtonLoop
              label="Connexion"
              variant="primary"
              onPress={handleLogin}
              loading={loading}
              style={{ marginTop: 16 }}
            />

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Pas de compte ? </Text>
              <TouchableOpacity onPress={() => router.push("/signup")}>
                <Text style={styles.registerLink}>S’inscrire</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },

  container: { flex: 1 },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },

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
