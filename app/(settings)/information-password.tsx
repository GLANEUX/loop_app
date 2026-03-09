import { router } from "expo-router";
import React, { useCallback, useState } from "react";
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
import EyeIcon from "@/assets/icons/icons/eye-1.svg";
import HideIcon from "@/assets/icons/icons/hide-white.svg";
import { ButtonLoop } from "@/components/ui";
import { Palette, Typography } from "@/constants/theme";
import { ApiRequestError, formatApiError } from "@/lib/api";
import { getAccessToken } from "@/lib/session";
import { updateMyPassword } from "@/lib/user";

export default function InformationPasswordScreen() {
  const insets = useSafeAreaInsets();
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Validation criteria
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecialChar = /[@$!%*?&]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword !== "";

  const isFormValid = hasMinLength && hasUppercase && hasNumber && hasSpecialChar && passwordsMatch && currentPassword !== "";

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    if (!isFormValid) return;

    setLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        setError("Tu dois être connecté pour continuer.");
        setLoading(false);
        return;
      }
      
      await updateMyPassword(currentPassword, newPassword, token);
      
      setSuccess("Mot de passe mis à jour avec succès.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      if (err?.name === "ApiRequestError" && err.status === 401) {
        setError("Mot de passe actuel invalide.");
      } else {
        setError(formatApiError(err));
      }
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
            <Text style={styles.headerTitle}>Mot de passe</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.description}>
              Votre nouveau mot de passe doit être différent de l'ancien pour assurer la sécurité de votre compte.
            </Text>
          </View>

          <View style={styles.card}>
            {/* Password Current */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mot de passe actuel</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="••••••••"
                  placeholderTextColor={Palette.grey600}
                  secureTextEntry={!showCurrent}
                />
                <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} style={styles.eyeIcon}>
                  {showCurrent ? <HideIcon width={20} height={20} /> : <EyeIcon width={20} height={20} />}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />

            {/* New Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nouveau mot de passe</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Nouveau mot de passe"
                  placeholderTextColor={Palette.grey600}
                  secureTextEntry={!showNew}
                />
                <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeIcon}>
                  {showNew ? <HideIcon width={20} height={20} /> : <EyeIcon width={20} height={20} />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirmer le nouveau mot de passe</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirmer"
                  placeholderTextColor={Palette.grey600}
                  secureTextEntry={!showConfirm}
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeIcon}>
                  {showConfirm ? <HideIcon width={20} height={20} /> : <EyeIcon width={20} height={20} />}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Validation Requirements */}
          <View style={styles.requirementsCard}>
            <Text style={styles.requirementsTitle}>Le mot de passe doit contenir :</Text>
            <RequirementItem met={hasMinLength} text="8 caractères minimum" />
            <RequirementItem met={hasUppercase} text="Une majuscule" />
            <RequirementItem met={hasNumber} text="Un chiffre" />
            <RequirementItem met={hasSpecialChar} text="Un caractère spécial (@$!%*?&)" />
            <RequirementItem met={passwordsMatch} text="Les mots de passe correspondent" />
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
            label="Mettre à jour le mot de passe"
            onPress={handleSave}
            loading={loading}
            style={styles.saveButton}
            disabled={!isFormValid || loading || !!success}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const RequirementItem = ({ met, text }: { met: boolean; text: string }) => (
  <View style={styles.requirementItem}>
    <View style={[styles.requirementDot, met && styles.requirementDotMet]} />
    <Text style={[styles.requirementText, met && styles.requirementTextMet]}>{text}</Text>
  </View>
);

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
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    padding: 20,
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    ...Typography.smallSemibold,
    color: Palette.grey300,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  input: {
    flex: 1,
    ...Typography.bodyMedium,
    color: Palette.bgWhite,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    marginVertical: 8,
  },
  requirementsCard: {
    marginTop: 24,
    paddingHorizontal: 8,
    gap: 10,
  },
  requirementsTitle: {
    ...Typography.smallSemibold,
    color: Palette.grey300,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  requirementDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Palette.grey700,
  },
  requirementDotMet: {
    backgroundColor: Palette.valid,
  },
  requirementText: {
    ...Typography.smallLight,
    color: Palette.grey600,
  },
  requirementTextMet: {
    color: Palette.valid,
    ...Typography.smallSemibold,
  },
  feedbackContainer: {
    marginTop: 24,
    paddingHorizontal: 4,
  },
  errorText: {
    ...Typography.bodyMedium,
    color: Palette.error,
    fontSize: 14,
    textAlign: "center",
  },
  successText: {
    ...Typography.bodyMedium,
    color: Palette.valid,
    fontSize: 14,
    textAlign: "center",
  },
  saveButton: {
    marginTop: 24,
    width: "100%",
    borderRadius: 16,
  },
});
