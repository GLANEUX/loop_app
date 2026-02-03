import { OnboardingLayout } from "@/components/layout";
import { ButtonLoop } from "@/components/ui";
import { AuthTextField } from "@/components/ui/input";
import { Palette, Typography } from "@/constants/theme";
import { formatApiError } from "@/lib/api";
import { getAccessToken } from "@/lib/session";
import { getMyProfileCached, updateMyEmail } from "@/lib/user";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function InformationEmailScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const token = await getAccessToken();
        if (!token) return;
        const me = await getMyProfileCached(token);
        if (active) setEmail(me.email || "");
      } catch {
        // ignore prefill error
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    const normalized = email.trim().toLowerCase();
    if (!normalized) {
      setError("Renseigne ton e-mail.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      setError("Format e-mail invalide.");
      return;
    }

    setLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        setError("Tu dois etre connecte pour continuer.");
        return;
      }
      await updateMyEmail(normalized, token);
      setSuccess("E-mail mis a jour.");
      setTimeout(() => router.back(), 350);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout
      imageSource={require("@/assets/images/auth/background-5.png")}
      progress={1}
      onBack={() => router.back()}
    >
      <Text style={styles.title}>Modifier mon e-mail</Text>
      <Text style={styles.subtitle}>Saisis ton nouvel e-mail puis enregistre.</Text>

      <AuthTextField
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        placeholder="mail@exemple.com"
        keyboardType="email-address"
        autoCapitalize="none"
        error={error}
      />

      {!!success && <Text style={styles.successText}>{success}</Text>}

      <View style={styles.buttonWrap}>
        <ButtonLoop label="Enregistrer" onPress={handleSave} loading={loading} />
      </View>
    </OnboardingLayout>
  );
}

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
  successText: {
    marginTop: 8,
    ...Typography.bodyMedium,
    color: Palette.valid,
  },
  buttonWrap: {
    marginTop: 28,
  },
});
