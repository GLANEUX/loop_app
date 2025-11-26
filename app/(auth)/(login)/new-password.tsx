// src/screens/NewPasswordScreen.tsx
import OpenEyeIcon from "@/assets/icons/icons/eye-1.svg";
import KeyIcon from "@/assets/icons/icons/group-1539-1.svg";
import CloseEyeIcon from "@/assets/icons/icons/hide-white.svg";

import { ButtonLoop } from "@/components/ui";
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

export const NewPasswordScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [secure1, setSecure1] = useState(true);
  const [secure2, setSecure2] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = () => {
    if (!password || !passwordConfirm) {
      return setError("Veuillez remplir les deux champs de mot de passe.");
    }
    if (password.length < 6) {
      return setError("Le mot de passe doit contenir au moins 6 caractères.");
    }
    if (password !== passwordConfirm) {
      return setError("Les mots de passe ne correspondent pas.");
    }

    setError(null);
    console.log("New password set:", password);

    router.replace("/(auth)/(login)/password-changed");
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
            <Text style={styles.title}>Créer un nouveau{"\n"}mot de passe</Text>
          </View>

          {/* CARD */}
          <View style={styles.cardWrapper}>
            <View style={styles.cardOverlay}>
              <Text style={styles.sectionTitle}>Mot de passe</Text>

              {error && <Text style={styles.errorText}>{error}</Text>}

              <AuthTextField
                label="Créer un mot de passe"
                value={password}
                onChangeText={setPassword}
                placeholder="Créer un mot de passe"
                secureTextEntry={secure1}
                autoCapitalize="none"
                LeftIcon={KeyIcon}
                RightIcon={secure1 ? CloseEyeIcon : OpenEyeIcon}
                onToggleSecure={() => setSecure1((prev) => !prev)}
                // on montre l’erreur sur les champs seulement si error existe
                error={error ?? undefined}
              />

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
                error={error ?? undefined}
              />

              <ButtonLoop
                label="Confirmer"
                onPress={handleConfirm}
                style={{ marginTop: 20 }}
              />
            </View>
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
  },

  /* ---- HEADER ---- */
  header: {
    marginTop: 32,
    marginBottom: 12,
  },
  title: {
    ...Typography.title1Bold,
    color: Palette.bgWhite,
  },

  /* ---- CARD ---- */
  cardWrapper: {
    marginTop: 12,
    borderRadius: 32,
    overflow: "hidden",
  },
  cardOverlay: {
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingVertical: 24,
    paddingHorizontal: 20,
    gap: 14,
    borderRadius: 32,
  },
  sectionTitle: {
    ...Typography.title3Bold,
    color: Palette.bgWhite,
    marginBottom: 8,
  },
  errorText: {
    ...Typography.smallLight,
    color: Palette.primary,
    marginBottom: 4,
  },
});

export default NewPasswordScreen;
