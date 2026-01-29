import RightChevronIcon from "@/assets/icons/icons/direction-right-2-outline-white.svg";
import EditAvatarIcon from "@/assets/icons/icons/edit-outline-white.svg";
import EyeIcon from "@/assets/icons/icons/eye-1.svg";
import SettingsIcon from "@/assets/icons/icons/settings-outline-white.svg";
import { Env } from "@/constants/env";
import { Palette, Typography } from "@/constants/theme";
import { formatApiError } from "@/lib/api";
import { getAccessToken } from "@/lib/session";
import { getMyProfile, updateMyAvatar, UserMe } from "@/lib/user";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as FileSystem from "expo-file-system/legacy";
import * as DocumentPicker from "expo-document-picker";

const fallbackAvatar = require("@/assets/images/landing/landing-9.jpg");

const formatDate = (value?: string | null) => {
  if (!value) return "Non renseignée";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const ProfileScreen: React.FC = () => {
  const [user, setUser] = useState<UserMe | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [avatarLocalUri, setAvatarLocalUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const handleOnClic = () => {
    router.replace("/(settings)/settings");
  };

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await getAccessToken();
        if (!token) {
          if (isMounted) {
            setError("Tu dois être connecté pour voir ton profil.");
            setLoading(false);
          }
          return;
        }
        if (isMounted) {
          setToken(token);
        }
        const data = await getMyProfile(token);
        if (isMounted) {
          setUser(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(formatApiError(err));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const refreshProfile = async (active = true) => {
    if (!token) return;
    try {
      const data = await getMyProfile(token);
      if (active) setUser(data);
    } catch (err) {
      if (active) setError(formatApiError(err));
    }
  };

  const profile = user?.profile;
  const displayName = useMemo(() => {
    const parts = [profile?.firstName, profile?.lastName].filter(Boolean);
    if (parts.length > 0) return parts.join(" ");
    return user?.pseudo || "Utilisateur";
  }, [profile?.firstName, profile?.lastName, user?.pseudo]);

  const handle = user?.pseudo ? `@${user.pseudo}` : user?.email || "";
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
      const safeVersion = avatarVersion ? encodeURIComponent(avatarVersion) : "latest";
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
        setError("Impossible de récupérer l'image.");
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
        setError("Tu dois être connecté pour continuer.");
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
      await refreshProfile();
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setAvatarLoading(false);
    }
  };

  const avatarSource =
    avatarLocalUri
      ? { uri: avatarLocalUri }
      : avatarUri && token
      ? { uri: avatarUri, headers: { Authorization: `Bearer ${token}` } }
      : avatarUri
        ? { uri: avatarUri }
        : fallbackAvatar;

  const instruments = (profile?.instruments ?? [])
    .map((item) =>
      item.level ? `${item.instrument} · ${item.level}` : item.instrument,
    )
    .filter(Boolean);

  const stylesMusicaux = (profile?.genres ?? []).filter(Boolean);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER : avatar centré + settings en haut à droite */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.eyeButton}>
            <EyeIcon width={22} height={22} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={handleOnClic}
          >
            <SettingsIcon width={22} height={22} />
          </TouchableOpacity>

          <View style={styles.avatarWrapper}>
            <Image source={avatarSource} style={styles.avatar} />
            <TouchableOpacity
              style={styles.editAvatarButton}
              onPress={handleChangeAvatar}
              disabled={avatarLoading}
            >
              <EditAvatarIcon width={25} height={25} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Nom + handle */}
        <View style={styles.identityBlock}>
          <Text style={styles.name}>{displayName}</Text>
          {!!handle && <Text style={styles.handle}>{handle}</Text>}
          {loading && <Text style={styles.statusText}>Chargement...</Text>}
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        {/* Informations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>
          <InfoRow label="Email" value={user?.email || "Non renseigné"} />
          <InfoRow label="Rôle" value={user?.role || "Non renseigné"} />
          <InfoRow
            label="Téléphone"
            value={profile?.phoneNumber || "Non renseigné"}
          />
          <InfoRow label="Date de naissance" value={formatDate(profile?.birthDate)} />
          <InfoRow label="Genre" value={profile?.gender || "Non renseigné"} />
          <InfoRow
            label="Visibilité"
            value={
              profile?.isPublic === undefined || profile?.isPublic === null
                ? "Non renseignée"
                : profile.isPublic
                  ? "Public"
                  : "Privé"
            }
          />
        </View>

        {/* À propos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>
          <Text
            style={styles.about}
            numberOfLines={isAboutExpanded ? undefined : 4}
          >
            {profile?.bio?.trim().length
              ? profile.bio
              : "Aucune bio pour le moment."}
          </Text>
          {profile?.bio?.trim().length ? (
            <TouchableOpacity
              onPress={() => setIsAboutExpanded((prev) => !prev)}
            >
              <Text style={styles.readMore}>
                {isAboutExpanded ? "Lire moins" : "Lire plus"}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Instruments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instruments</Text>
          <View style={styles.chipsRow}>
            {instruments.length > 0 ? (
              instruments.map((label) => <Chip key={label} label={label} />)
            ) : (
              <Text style={styles.sectionValue}>Aucun instrument</Text>
            )}
          </View>
        </View>

        {/* Styles musicaux */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Styles musicaux</Text>
          <View style={styles.chipsRow}>
            {stylesMusicaux.length > 0 ? (
              stylesMusicaux.map((label) => <Chip key={label} label={label} />)
            ) : (
              <Text style={styles.sectionValue}>Aucun style</Text>
            )}
          </View>
        </View>

        {/* Projets en ligne */}
        {/* Projets en ligne */}
        <View style={[styles.section, { marginBottom: 120 }]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Projets en ligne</Text>
            <TouchableOpacity>
              <RightChevronIcon width={25} height={25} />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.projectsRow}
          >
            <View style={styles.projectCard} />
            <View style={styles.projectCard} />
            <View style={styles.projectCard} />
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

type ChipProps = {
  label: string;
};

const Chip: React.FC<ChipProps> = ({ label }) => (
  <View style={styles.chip}>
    <Text style={styles.chipText}>{label}</Text>
  </View>
);

type InfoRowProps = {
  label: string;
  value: string;
};

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

// ... tes styles restent identiques

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.bgBlack,
  },
  container: {
    flex: 1,
    marginTop: 15,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },

  /* HEADER */
  header: {
    marginTop: 16,
    alignItems: "center",
    position: "relative",
  },
  settingsButton: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 40,
    height: 50,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  eyeButton: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 40,
    height: 50,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarWrapper: {
    marginTop: 10,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 35,
    height: 35,
    borderRadius: 26,
    backgroundColor: Palette.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Identité */
  identityBlock: {
    marginTop: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    ...Typography.title2Bold,
    color: Palette.bgWhite,
    textAlign: "left",
  },
  handle: {
    marginTop: 4,
    ...Typography.bodyMedium,
    color: Palette.grey600,
    textAlign: "left",
  },
  statusText: {
    marginTop: 6,
    ...Typography.bodyMedium,
    color: Palette.grey300,
  },
  errorText: {
    marginTop: 6,
    ...Typography.bodyMedium,
    color: Palette.primary,
    textAlign: "center",
  },

  /* Sections */
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    ...Typography.title3Bold,
    color: Palette.bgWhite,
    marginBottom: 8,
  },
  sectionValue: {
    ...Typography.bodyMedium,
    color: Palette.bgWhite,
  },
  infoRow: {
    marginTop: 10,
  },
  infoLabel: {
    ...Typography.bodyBold,
    color: Palette.grey300,
    marginBottom: 2,
  },
  infoValue: {
    ...Typography.bodyMedium,
    color: Palette.bgWhite,
  },
  about: {
    ...Typography.bodyMedium,
    color: Palette.bgWhite,
    lineHeight: 22,
  },
  readMore: {
    marginTop: 8,
    ...Typography.bodyBold,
    color: Palette.bgWhite,
  },

  /* Chips */
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  chip: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: Palette.bgWhite,
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: {
    ...Typography.bodyMedium,
    color: Palette.bgBlack,
  },

  /* Projets */
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chevron: {
    fontSize: 24,
    color: Palette.bgWhite,
  },
  projectsRow: {
    marginTop: 16,
    paddingRight: 24,
    gap: 16,
  },
  projectCard: {
    width: 180,
    height: 220,
    borderRadius: 24,
    backgroundColor: Palette.grey800,
  },
});

export default ProfileScreen;
