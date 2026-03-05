// src/screens/onboarding/NameScreen.tsx
import { OnboardingLayout } from "@/components/layout";
import { ButtonLoop, OnboardingInput } from "@/components/ui";
import { Palette, Typography } from "@/constants/theme";
import { formatApiError } from "@/lib/api";
import { getAccessToken } from "@/lib/session";
import { getMyProfileCached, updateMyProfile } from "@/lib/user";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export const NameScreen: React.FC = () => {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      const token = await getAccessToken();
      if (!token) return;
      try {
        const me = await getMyProfileCached(token);
        if (!active || !me.profile) return;
        setFirstName((prev) => prev || me.profile?.firstName || "");
        setLastName((prev) => prev || me.profile?.lastName || "");
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
    if (!firstName.trim() || !lastName.trim()) {
      setError("Renseigne ton prénom et ton nom pour continuer.");
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

      await updateMyProfile(
        {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        },
        token,
      );

      router.push("/birthdate");
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout
      imageSource={require("@/assets/images/auth/background-7.png")}
      progress={0.1}
      disableBack
    >
      <Text style={styles.title}>Ton nom</Text>
      <Text style={styles.subtitle}>Indique ton prénom et ton nom.</Text>

      <View style={styles.formContainer}>
        <OnboardingInput
          value={firstName}
          onChangeText={(text) => {
            setFirstName(text);
            if (error) setError(null);
          }}
          placeholder="Prénom"
          autoCapitalize="words"
        />

        <OnboardingInput
          value={lastName}
          onChangeText={(text) => {
            setLastName(text);
            if (error) setError(null);
          }}
          placeholder="Nom"
          autoCapitalize="words"
          error={error}
        />
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
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 32,
  },
  formContainer: {
    marginTop: 8,
  },
  buttonWrapper: {
    marginTop: 16,
  },
});

export default NameScreen;
