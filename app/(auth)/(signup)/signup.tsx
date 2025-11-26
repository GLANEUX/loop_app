// src/screens/SignupScreen.tsx
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

export const SignupScreen: React.FC = () => {
  const router = useRouter();

  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [secure1, setSecure1] = useState(true);
  const [secure2, setSecure2] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = () => {
    if (!pseudo || !email || !password || !passwordConfirm) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setError(null);
    console.log("Signup:", { pseudo, email, password });
    router.replace("/(app)/home");
  };

  const goToLogin = () => router.push("/(auth)/(login)/login");

  const handleSocial = (provider: "facebook" | "apple" | "google") => {
    console.log("Social signup:", provider);
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
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Bienvenue ! 👋</Text>
          <Text style={styles.subtitle}>Prêt·e à créer la magie ?</Text>
        </View>

        {/* CARD OPAQUE */}
        <View style={styles.card}>
          {/* On peut afficher un message global si tu veux */}
          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* PSEUDO */}
          <AuthTextField
            label="Pseudo"
            value={pseudo}
            onChangeText={setPseudo}
            placeholder="Choisis un pseudo"
            autoCapitalize="none"
            // pas d’icône pour l’instant, tu pourras en mettre un plus tard
            error={error}
          />

          {/* EMAIL */}
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

          {/* PASSWORD */}
          <AuthTextField
            label="Mot de passe"
            value={password}
            onChangeText={setPassword}
            placeholder="Créer un mot de passe"
            secureTextEntry={secure1}
            autoCapitalize="none"
            LeftIcon={KeyIcon}
            RightIcon={secure1 ? CloseEyeIcon : OpenEyeIcon}
            onToggleSecure={() => setSecure1((prev) => !prev)}
            error={error}
          />

          {/* PASSWORD CONFIRM */}
          <AuthTextField
            label="Confirmer le mot de passe"
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
            placeholder="Confirmer le mot de passe"
            secureTextEntry={secure2}
            autoCapitalize="none"
            LeftIcon={KeyIcon}
            RightIcon={secure2 ? CloseEyeIcon : OpenEyeIcon}
            onToggleSecure={() => setSecure2((prev) => !prev)}
            error={error}
          />

          {/* BUTTON SIGNUP */}
          <ButtonLoop
            label="Inscription"
            variant="primary"
            onPress={handleSignup}
            style={{ marginTop: 12 }}
          />

          {/* SOCIAL */}
          <SocialAuthSection onSelect={handleSocial} />

          {/* ALREADY ACCOUNT */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Déjà un compte ? </Text>
            <TouchableOpacity onPress={goToLogin}>
              <Text style={styles.registerLink}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "flex-start",
    paddingHorizontal: 24,
  },

  header: {
    marginTop: 32,
    marginBottom: 8,
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

  card: {
    marginTop: 16,
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

export default SignupScreen;
