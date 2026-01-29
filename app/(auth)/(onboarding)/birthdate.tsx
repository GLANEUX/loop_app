// src/screens/onboarding/BirthdateScreen.tsx
import { OnboardingLayout } from "@/components/layout";
import { ButtonLoop } from "@/components/ui";
import { Palette, Typography } from "@/constants/theme";
import { formatApiError } from "@/lib/api";
import { getAccessToken } from "@/lib/session";
import { getMyProfileCached, updateMyProfile } from "@/lib/user";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

export const BirthdateScreen: React.FC = () => {
  const router = useRouter();
  const [birthdate, setBirthdate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      const token = await getAccessToken();
      if (!token) return;
      try {
        const me = await getMyProfileCached(token);
        const raw = me.profile?.birthDate;
        if (!active || !raw) return;
        const [year, month, day] = raw.split("-");
        if (year && month && day) {
          setBirthdate((prev) => prev || `${day}/${month}/${year}`);
        }
      } catch {
        // ignore prefill errors
      }
    };
    loadProfile();
    return () => {
      active = false;
    };
  }, []);

  const handleChange = (value: string) => {
    // on garde seulement les chiffres
    const digits = value.replaceAll(/[^\d]/g, "").slice(0, 8);

    let result = digits;
    if (digits.length > 4) {
      result = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    } else if (digits.length > 2) {
      result = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }

    setBirthdate(result);
    if (error) setError(null); // on efface l'erreur dès que l'utilisateur retape
  };

  const handleContinue = async () => {
    const digits = birthdate.replaceAll(/[^\d]/g, ""); // JJMMYYYY

    if (digits.length !== 8) {
      setError("Entre une date au format JJ/MM/AAAA.");
      return;
    }

    const day = parseInt(digits.slice(0, 2), 10);
    const month = parseInt(digits.slice(2, 4), 10) - 1; // 0-11
    const year = parseInt(digits.slice(4), 10);

    const date = new Date(year, month, day);

    // date invalide
    if (
      Number.isNaN(date.getTime()) ||
      date.getDate() !== day ||
      date.getMonth() !== month ||
      date.getFullYear() !== year
    ) {
      setError("Cette date n'est pas valide.");
      return;
    }

    // calcul de l'âge
    const today = new Date();
    let age = today.getFullYear() - year;
    const hasHadBirthdayThisYear =
      today.getMonth() > month ||
      (today.getMonth() === month && today.getDate() >= day);

    if (!hasHadBirthdayThisYear) {
      age -= 1;
    }

    if (age < 18) {
      setError("Tu dois avoir au moins 18 ans pour rejoindre Loop.");
      return;
    }

    const isoDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day,
    ).padStart(2, "0")}`;

    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        setError("Tu dois être connecté pour continuer.");
        return;
      }

      await updateMyProfile({ birthDate: isoDate }, token);
      router.push("/(onboarding)/gender");
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout
      imageSource={require("@/assets/images/auth/background-4.png")}
      progress={0.4}
    >
      <Text style={styles.title}>Ta date de naissance</Text>
      <Text style={styles.subtitle}>
        Tu dois avoir au moins 18 ans pour rejoindre Loop.
      </Text>

      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          keyboardType="number-pad"
          placeholder="JJ/MM/AAAA"
          placeholderTextColor="rgba(255,255,255,0.6)"
          value={birthdate}
          onChangeText={handleChange}
        />
        <View style={[styles.underline, error && styles.underlineError]} />

        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      <Text style={styles.reminder}>
        Tu dois avoir au moins 18 ans pour rejoindre la plateforme
      </Text>

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
    marginBottom: 12,
  },
  subtitle: {
    ...Typography.bodyRegular,
    color: Palette.bgWhite,
    marginBottom: 32,
  },
  inputWrapper: {
    marginBottom: 12,
  },
  input: {
    ...Typography.title2Bold,
    color: Palette.bgWhite,
    letterSpacing: 4,
  },
  inputError: {
    color: Palette.primary,
  },
  underline: {
    height: 2,
    backgroundColor: Palette.bgWhite,
    marginTop: 4,
  },
  underlineError: {
    backgroundColor: Palette.primary,
  },
  errorText: {
    marginTop: 6,
    ...Typography.smallLight,
    color: Palette.primary,
  },
  reminder: {
    ...Typography.bodyRegular,
    color: Palette.bgWhite,
    marginBottom: 32,
  },
  buttonWrapper: {
    marginTop: 8,
  },
});

export default BirthdateScreen;
