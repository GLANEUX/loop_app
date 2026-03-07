import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import BackIcon from "@/assets/icons/icons/direction-left-2-outline-white.svg";
import { ButtonLoop } from "@/components/ui";
import { Palette, Typography } from "@/constants/theme";
import { formatApiError } from "@/lib/api";
import { getAccessToken } from "@/lib/session";
import { getMyProfileCached, updateMyProfile } from "@/lib/user";

export default function ProfileBirthDateScreen() {
  const insets = useSafeAreaInsets();
  const [birthDate, setBirthDate] = useState("");
  const [initialBirthDate, setInitialBirthDate] = useState("");
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
        if (active) {
          const raw = me.profile?.birthDate || "";
          setInitialBirthDate(raw);
          if (raw) {
            const [year, month, day] = raw.split("-");
            if (year && month && day) {
              setBirthDate(`${day}/${month}/${year}`);
            }
          }
        }
      } catch {
        // ignore prefill error
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const handleChange = (value: string) => {
    const digits = value.replaceAll(/[^\d]/g, "").slice(0, 8);
    let result = digits;
    if (digits.length > 4) {
      result = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    } else if (digits.length > 2) {
      result = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    setBirthDate(result);
    if (error) setError(null);
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    const digits = birthDate.replaceAll(/[^\d]/g, "");
    if (digits.length !== 8) {
      setError("Entre une date au format JJ/MM/AAAA.");
      return;
    }

    const day = parseInt(digits.slice(0, 2), 10);
    const month = parseInt(digits.slice(2, 4), 10) - 1;
    const year = parseInt(digits.slice(4), 10);
    const date = new Date(year, month, day);

    if (
      Number.isNaN(date.getTime()) ||
      date.getDate() !== day ||
      date.getMonth() !== month ||
      date.getFullYear() !== year
    ) {
      setError("Cette date n'est pas valide.");
      return;
    }

    const today = new Date();
    let age = today.getFullYear() - year;
    const hasHadBirthdayThisYear =
      today.getMonth() > month ||
      (today.getMonth() === month && today.getDate() >= day);
    if (!hasHadBirthdayThisYear) age -= 1;

    if (age < 18) {
      setError("Tu dois avoir au moins 18 ans.");
      return;
    }

    const isoDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (isoDate === initialBirthDate) {
      router.back();
      return;
    }

    setLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        setError("Tu dois être connecté pour continuer.");
        setLoading(false);
        return;
      }
      
      await updateMyProfile({ birthDate: isoDate }, token);
      setSuccess("Date de naissance mise à jour.");
      setInitialBirthDate(isoDate);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const currentIsoDate = (() => {
    const digits = birthDate.replaceAll(/[^\d]/g, "");
    if (digits.length !== 8) return "";
    const day = digits.slice(0, 2);
    const month = digits.slice(2, 4);
    const year = digits.slice(4);
    return `${year}-${month}-${day}`;
  })();

  const isUnchanged = currentIsoDate === initialBirthDate;
  const isIncomplete = birthDate.length < 10;
  const isSaveDisabled = loading || !!success || isUnchanged || isIncomplete;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 8 : 0}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={router.back}>
              <BackIcon
                width={24}
                height={24}
                style={{ transform: [{ scaleX: -1 }] }}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Date de naissance</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.description}>
              Votre âge est affiché sur votre profil pour aider les musiciens à trouver des partenaires de leur génération.
            </Text>
          </View>

          <View style={styles.onboardingInputWrapper}>
            <TextInput
              style={[styles.onboardingInput, error && styles.inputError]}
              keyboardType="number-pad"
              placeholder="JJ/MM/AAAA"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={birthDate}
              onChangeText={handleChange}
              autoFocus
            />
            <View style={[styles.underline, error && styles.underlineError]} />
          </View>

          {!!error && (
            <View style={styles.feedbackContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          {!!success && (
            <View style={styles.feedbackContainer}>
              <Text style={styles.successText}>{success}</Text>
            </View>
          )}

          <ButtonLoop
            label="Enregistrer les modifications"
            onPress={handleSave}
            loading={loading}
            style={styles.saveButton}
            disabled={isSaveDisabled}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.bgBlack,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  backButton: {
    position: "absolute",
    left: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  headerTitle: {
    ...Typography.title2Bold,
    color: Palette.bgWhite,
    fontSize: 20,
  },
  infoSection: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  description: {
    ...Typography.bodyRegular,
    color: Palette.grey300,
    lineHeight: 22,
    fontSize: 15,
  },
  onboardingInputWrapper: {
    marginTop: 20,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  onboardingInput: {
    ...Typography.title2Bold,
    color: Palette.bgWhite,
    letterSpacing: 4,
    fontSize: 28,
  },
  inputError: {
    color: Palette.primary,
  },
  underline: {
    height: 2,
    backgroundColor: Palette.bgWhite,
    marginTop: 8,
    opacity: 0.3,
  },
  underlineError: {
    backgroundColor: Palette.primary,
    opacity: 1,
  },
  feedbackContainer: {
    marginTop: 16,
    paddingHorizontal: 4,
  },
  errorText: {
    ...Typography.bodyMedium,
    color: Palette.error,
    fontSize: 14,
  },
  successText: {
    ...Typography.bodyMedium,
    color: Palette.valid,
    fontSize: 14,
  },
  saveButton: {
    marginTop: 32,
    width: "100%",
    borderRadius: 16,
  },
});
