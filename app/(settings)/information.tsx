import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import BackIcon from "@/assets/icons/icons/direction-left-2-outline-white.svg";
import ChevronRightIcon from "@/assets/icons/icons/direction-right-2-outline-white.svg";
import { Palette, Typography } from "@/constants/theme";
import { formatApiError } from "@/lib/api";
import { getAccessToken } from "@/lib/session";
import { getMyProfileCached, UserMe } from "@/lib/user";

export default function InformationScreen() {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<UserMe | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (force = false) => {
    setProfileError(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        setLoadingProfile(false);
        return;
      }
      const data = await getMyProfileCached(token, force);
      setUser(data);
    } catch (err) {
      setProfileError(formatApiError(err));
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProfile(true);
    }, [fetchProfile]),
  );

  const email = user?.email || "chargement...";
  const phone = user?.profile?.phoneNumber || "Non renseigné";

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
          keyboardDismissMode="on-drag"
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
            <Text style={styles.headerTitle}>Informations</Text>
          </View>

          {profileError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{profileError}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Compte</Text>
            <View style={styles.card}>
              <InfoRow
                label="E-mail"
                value={email}
                onPress={() => router.push("/information-email")}
              />
              <InfoRow
                label="Téléphone"
                value={phone}
                onPress={() => router.push("/information-phone")}
                isLast
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Sécurité</Text>
            <View style={styles.card}>
              <InfoRow
                label="Changement de mot de passe"
                value=""
                onPress={() => router.push("/information-password")}
                isLast
              />
            </View>
          </View>

          <View style={[styles.section, { marginTop: 20 }]}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => router.push("/delete-account")}
              activeOpacity={0.8}
            >
              <Text style={styles.deleteText}>Supprimer mon compte</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type InfoRowProps = {
  label: string;
  value: string;
  onPress?: () => void;
  isLast?: boolean;
};

const InfoRow: React.FC<InfoRowProps> = ({ label, value, onPress, isLast }) => (
  <TouchableOpacity
    style={[styles.row, isLast && styles.rowLast]}
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={onPress ? 0.75 : 1}
  >
    <View style={styles.rowLeft}>
      <Text style={styles.rowLabel}>{label}</Text>
    </View>
    <View style={[styles.rowRight, !value && { flex: 0 }]}>
      {value ? (
        <Text style={styles.rowValue} numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      {onPress && (
        <ChevronRightIcon width={18} height={18} color={Palette.grey600} />
      )}
    </View>
  </TouchableOpacity>
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
    paddingBottom: 60,
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    ...Typography.bodyBold,
    color: Palette.bgWhite,
    marginBottom: 12,
    marginLeft: 4,
    fontSize: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
    opacity: 0.7,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    overflow: "hidden",
  },
  row: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLeft: {
    flex: 1,
  },
  rowLabel: {
    ...Typography.bodyMedium,
    color: Palette.bgWhite,
    fontSize: 15,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "flex-end",
  },
  rowValue: {
    ...Typography.bodyRegular,
    color: Palette.primary50,
    textAlign: "right",
    flexShrink: 1,
    fontSize: 15,
  },
  deleteButton: {
    marginTop: 12,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: "rgba(238, 40, 59, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(238, 40, 59, 0.2)",
    alignItems: "center",
  },
  deleteText: {
    ...Typography.bodyBold,
    color: Palette.error,
    fontSize: 15,
  },
  errorBanner: {
    backgroundColor: "rgba(238, 40, 59, 0.1)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(238, 40, 59, 0.2)",
  },
  errorText: {
    ...Typography.smallLight,
    color: Palette.error,
    textAlign: "center",
  },
  footerSpacer: {
    height: 40,
  },
});
