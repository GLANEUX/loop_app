// src/screens/onboarding/BioScreen.tsx
import { OnboardingLayout } from "@/components/layout";
import { ButtonLoop } from "@/components/ui";
import { Palette, Typography } from "@/constants/theme";
import { formatApiError } from "@/lib/api";
import { getAccessToken } from "@/lib/session";
import { getMyProfileCached, updateMyProfile } from "@/lib/user";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

export const BioScreen: React.FC = () => {
  const router = useRouter();
  const [bio, setBio] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      const token = await getAccessToken();
      if (!token) return;
      try {
        const me = await getMyProfileCached(token);
        if (!active || !me.profile?.bio) return;
        setBio((prev) => prev || me.profile?.bio || "");
      } catch {
        // ignore prefill errors
      }
    };
    loadProfile();
    return () => {
      active = false;
    };
  }, []);

  const handleContinue = async () => {
    const trimmed = bio.trim();
    if (!trimmed) {
      setError("Ajoute une petite bio pour continuer.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        setError("Tu dois être connecté pour continuer.");
        return;
      }

      await updateMyProfile({ bio: trimmed }, token);
      router.push("/welcome-rules");
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout
      imageSource={require("@/assets/images/auth/background-4.png")}
      progress={0.9}
    >
      <Text style={styles.title}>Ta bio</Text>
      <Text style={styles.subtitle}>
        Quelques mots sur ton univers musical et ce que tu recherches.
      </Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={bio}
          onChangeText={setBio}
          placeholder="Ex: Guitariste indie, je cherche des collabs soul/jazz."
          placeholderTextColor={Palette.grey300}
          multiline
          textAlignVertical="top"
          maxLength={280}
        />
        <View style={styles.underline} />
        <Text style={styles.counter}>{bio.trim().length}/280</Text>
      </View>

      <View style={styles.buttonWrapper}>
        <ButtonLoop label="Continuer" onPress={handleContinue} loading={loading} />
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  title: {
    ...Typography.title1Bold,
    color: Palette.bgWhite,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.bodyRegular,
    color: Palette.bgWhite,
    marginBottom: 24,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  input: {
    ...Typography.bodyRegular,
    color: Palette.bgWhite,
    minHeight: 140,
  },
  underline: {
    height: 2,
    backgroundColor: Palette.bgWhite,
    marginTop: 8,
  },
  counter: {
    ...Typography.smallLight,
    color: Palette.grey300,
    textAlign: "right",
    marginTop: 6,
  },
  errorText: {
    marginBottom: 12,
    ...Typography.bodyBold,
    color: Palette.primary,
  },
  buttonWrapper: {
    marginTop: 8,
  },
});

export default BioScreen;
