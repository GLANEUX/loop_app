import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Image,
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
import EditAvatarIcon from "@/assets/icons/icons/edit-outline-white.svg";
import { Env } from "@/constants/env";
import { Palette, Typography } from "@/constants/theme";
import { formatApiError } from "@/lib/api";
import { getAccessToken } from "@/lib/session";
import { getMyProfileCached, updateMyAvatar, UserMe } from "@/lib/user";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";

const fallbackAvatar = require("@/assets/images/landing/landing-9.jpg");

export default function ProfileEditScreen() {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<UserMe | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [avatarLocalUri, setAvatarLocalUri] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const fetchProfile = useCallback(async (force = false) => {
    setLoadingProfile(true);
    setProfileError(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        setLoadingProfile(false);
        return;
      }
      setToken(token);
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

  const profile = user?.profile;
  const pseudo = user?.pseudo || "";
  const bio = profile?.bio || "Non renseignée";
  let birthDateDisplay = "Non renseignée";
  if (profile?.birthDate) {
    const [y, m, d] = profile.birthDate.split("-");
    if (y && m && d) {
      birthDateDisplay = `${d}/${m}/${y}`;
    }
  }

  const instruments = (profile?.instruments ?? [])
    .map((item) =>
      item.level ? `${item.instrument} · ${item.level}` : item.instrument,
    )
    .filter(Boolean);
  const genres = (profile?.genres ?? []).filter(Boolean);

  const instrumentsToShow = instruments.length > 0 ? instruments : [];
  const genresToShow = genres.length > 0 ? genres : [];

  const avatarUriBase =
    profile?.hasAvatar === false
      ? null
      : profile?.avatarUrl
        ? profile.avatarUrl
        : profile?.hasAvatar === true
          ? `${Env.API_URL}/user/me/avatar`
          : null;
  const avatarVersion = profile?.updatedAt || "";
  const avatarUri =
    avatarUriBase && avatarVersion
      ? `${avatarUriBase}?v=${encodeURIComponent(avatarVersion)}`
      : avatarUriBase;

  useEffect(() => {
    let active = true;
    const downloadAvatar = async () => {
      if (!token || !profile?.hasAvatar || !avatarUri) {
        if (active) setAvatarLocalUri(null);
        return;
      }
      const cacheDir = FileSystem.cacheDirectory;
      if (!cacheDir) return;
      const safeVersion = avatarVersion
        ? encodeURIComponent(avatarVersion)
        : "latest";
      const fileUri = `${cacheDir}avatar-${user?.id ?? "me"}-${safeVersion}.img`;

      try {
        const info = await FileSystem.getInfoAsync(fileUri);
        if (info.exists) {
          if (active) setAvatarLocalUri(fileUri);
          return;
        }
        const result = await FileSystem.downloadAsync(avatarUri, fileUri, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (active && result?.uri) {
          setAvatarLocalUri(result.uri);
        }
      } catch {
        if (active) setAvatarLocalUri(null);
      }
    };
    downloadAvatar();
    return () => {
      active = false;
    };
  }, [token, profile?.hasAvatar, avatarUri, avatarVersion, user?.id]);

  const avatarSource = avatarLocalUri
    ? { uri: avatarLocalUri }
    : avatarUri && token
      ? { uri: avatarUri, headers: { Authorization: `Bearer ${token}` } }
      : avatarUri
        ? { uri: avatarUri }
        : fallbackAvatar;

  const handleChangeAvatar = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: false,
        copyToCacheDirectory: true,
        type: ["image/*"],
      });

      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset?.uri) {
        setProfileError("Impossible de récupérer l'image.");
        return;
      }

      const originalUri = asset.uri;
      let finalUri = originalUri;
      const fileName = asset.name ?? `avatar-${Date.now()}`;

      if (originalUri.startsWith("content://") && FileSystem.cacheDirectory) {
        const dest = `${FileSystem.cacheDirectory}${fileName}`;
        await FileSystem.copyAsync({ from: originalUri, to: dest });
        finalUri = dest;
      }

      if (!token) {
        setProfileError("Tu dois être connecté pour continuer.");
        return;
      }

      setAvatarLoading(true);
      await updateMyAvatar(
        {
          uri: finalUri,
          name: fileName,
          type: asset.mimeType ?? "image/jpeg",
        },
        token,
      );
      await fetchProfile(true);
    } catch (err) {
      setProfileError(formatApiError(err));
    } finally {
      setAvatarLoading(false);
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
            <Text style={styles.headerTitle}>Editer le profil</Text>
          </View>

          <View style={styles.topProfileSection}>
            <View style={styles.avatarWrapper}>
              <Image source={avatarSource} style={styles.avatar} />
              <TouchableOpacity
                style={styles.avatarEditButton}
                onPress={handleChangeAvatar}
                disabled={avatarLoading}
              >
                <EditAvatarIcon width={18} height={18} />
              </TouchableOpacity>
            </View>
          </View>

          {!!profileError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{profileError}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Informations</Text>
            <View style={styles.card}>
              <InfoRow
                label="Pseudo"
                value={pseudo}
                onPress={() => router.push("/profile-pseudo")}
              />
              <InfoRow
                label="Biographie"
                value={bio.slice(0, 15) + (bio.length > 15 ? "..." : "")}
                onPress={() => router.push("/profile-bio")}
              />
              <InfoRow
                label="Naissance"
                value={birthDateDisplay}
                onPress={() => router.push("/profile-birthdate")}
                isLast
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeader}>Instruments</Text>
              <TouchableOpacity
                onPress={() => router.push("/skills-edit")}
                style={styles.editSectionButton}
              >
                <EditAvatarIcon width={16} height={16} />
                <Text style={styles.editSectionText}>Modifier</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.chipsContainer}>
              {instrumentsToShow.map((label) => (
                <Chip key={label} label={label} />
              ))}
              {instrumentsToShow.length === 0 && (
                <Text style={styles.emptyText}>Aucun instrument renseigné</Text>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeader}>Styles musicaux</Text>
              <TouchableOpacity
                onPress={() => router.push("/styles-edit")}
                style={styles.editSectionButton}
              >
                <EditAvatarIcon width={16} height={16} />
                <Text style={styles.editSectionText}>Modifier</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.chipsContainer}>
              {genresToShow.map((label) => (
                <Chip key={label} label={label} />
              ))}
              {genresToShow.length === 0 && (
                <Text style={styles.emptyText}>Aucun style renseigné</Text>
              )}
            </View>
          </View>

          <View style={styles.footerSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const Chip = ({ label }: { label: string }) => (
  <View style={styles.chip}>
    <Text style={styles.chipText}>{label}</Text>
  </View>
);

const InfoRow = ({
  label,
  value,
  onPress,
  isLast,
}: {
  label: string;
  value: string;
  onPress?: () => void;
  isLast?: boolean;
}) => (
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
  topProfileSection: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    marginTop: 10,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  avatarEditButton: {
    position: "absolute",
    right: -4,
    bottom: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Palette.bgBlack,
    zIndex: 1,
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
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  editSectionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  editSectionText: {
    ...Typography.smallSemibold,
    color: Palette.bgWhite,
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
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "flex-end",
  },
  rowLabel: {
    ...Typography.bodyMedium,
    color: Palette.bgWhite,
    fontSize: 15,
  },
  rowValue: {
    ...Typography.bodyRegular,
    color: Palette.primary50,
    textAlign: "right",
    flexShrink: 1,
    fontSize: 15,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 4,
  },
  chip: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  chipText: {
    ...Typography.bodyMedium,
    color: Palette.bgWhite,
    fontSize: 14,
  },
  emptyText: {
    ...Typography.smallLight,
    color: Palette.grey600,
    fontStyle: "italic",
    marginLeft: 4,
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
