import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BackIcon from "@/assets/icons/icons/direction-left-2-outline-white.svg";
import { ButtonLoop } from "@/components/ui";
import { Palette, Typography } from "@/constants/theme";
import { formatApiError } from "@/lib/api";
import { getAccessToken, clearSession } from "@/lib/session";
import { apiRequest } from "@/lib/api";

export default function DeleteAccountScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Supprimer mon compte",
      "Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible et toutes vos données seront perdues.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            setError(null);
            try {
              const token = await getAccessToken();
              if (!token) throw new Error("Non authentifié");

              await apiRequest("/user/me", {
                method: "DELETE",
                authToken: token,
              });

              await clearSession();
              router.replace("/authPage");
            } catch (err) {
              setError(formatApiError(err));
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
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
          <Text style={styles.headerTitle}>Suppression du compte</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.warningTitle}>Action irréversible</Text>
          <Text style={styles.description}>
            La suppression de votre compte entraînera la perte définitive de :
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Votre profil et vos informations personnelles</Text>
            <Text style={styles.bulletItem}>• Tous vos matchs et conversations</Text>
            <Text style={styles.bulletItem}>• Vos préférences et réglages</Text>
          </View>
        </View>

        {!!error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.footer}>
          <ButtonLoop
            label="Supprimer mon compte définitivement"
            onPress={handleDeleteAccount}
            loading={loading}
            style={styles.deleteButton}
          />
          <TouchableOpacity style={styles.cancelButton} onPress={router.back}>
            <Text style={styles.cancelText}>Garder mon compte</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    marginBottom: 20,
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
    backgroundColor: "rgba(238, 40, 59, 0.05)",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(238, 40, 59, 0.15)",
  },
  warningTitle: {
    ...Typography.bodyBold,
    color: Palette.error,
    fontSize: 18,
    marginBottom: 12,
  },
  description: {
    ...Typography.bodyRegular,
    color: Palette.grey300,
    lineHeight: 22,
    fontSize: 15,
    marginBottom: 16,
  },
  bulletList: {
    gap: 10,
  },
  bulletItem: {
    ...Typography.bodyRegular,
    color: Palette.grey200,
    fontSize: 14,
  },
  errorBanner: {
    marginTop: 20,
    backgroundColor: "rgba(238, 40, 59, 0.1)",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(238, 40, 59, 0.2)",
  },
  errorText: {
    ...Typography.smallLight,
    color: Palette.error,
    textAlign: "center",
  },
  footer: {
    marginTop: 40,
    gap: 16,
  },
  deleteButton: {
    backgroundColor: Palette.error,
    borderRadius: 16,
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelText: {
    ...Typography.bodyBold,
    color: Palette.bgWhite,
    fontSize: 15,
  },
});
