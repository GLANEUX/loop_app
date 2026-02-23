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
import { getMyProfileCached, updateMyPseudo } from "@/lib/user";

export default function ProfilePseudoScreen() {
  const insets = useSafeAreaInsets();
  const [pseudo, setPseudo] = useState("");
  const [initialPseudo, setInitialPseudo] = useState("");
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
          const currentPseudo = me.pseudo || "";
          setPseudo(currentPseudo);
          setInitialPseudo(currentPseudo);
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

  const isChanged = pseudo.trim() !== initialPseudo.trim();

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    const normalized = pseudo.trim();
    
    if (!normalized) {
      setError("Veuillez renseigner votre pseudo.");
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
      
      await updateMyPseudo(normalized, token);
      
      setSuccess("Pseudo mis à jour avec succès.");
      setInitialPseudo(normalized);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

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
            <Text style={styles.headerTitle}>Modifier le pseudo</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.description}>
              Votre pseudo est votre identité sur Loop. Choisissez-le bien !
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Nouveau pseudo</Text>
              <TextInput
                style={styles.input}
                value={pseudo}
                onChangeText={(text) => {
                  setPseudo(text);
                  if (error) setError(null);
                }}
                placeholder="MonPseudo"
                placeholderTextColor={Palette.grey600}
                autoCapitalize="none"
                autoFocus
              />
            </View>
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
            disabled={!isChanged || loading || !!success}
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
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    padding: 20,
  },
  inputWrapper: {
    gap: 8,
  },
  inputLabel: {
    ...Typography.smallSemibold,
    color: Palette.grey300,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    ...Typography.bodyMedium,
    color: Palette.bgWhite,
    fontSize: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
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
