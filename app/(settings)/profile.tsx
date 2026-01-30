import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BackIcon from "@/assets/icons/icons/arrow-right-outline-white.svg";
import PinIcon from "@/assets/icons/icons/pin-outline-white.svg";
import SendIcon from "@/assets/icons/icons/direction-right-2-outline-white.svg";
import { Env } from "@/constants/env";
import { Palette, Typography } from "@/constants/theme";
import { formatApiError } from "@/lib/api";
import { getAccessToken } from "@/lib/session";
import { getMyProfile, UserMe } from "@/lib/user";
import * as FileSystem from "expo-file-system/legacy";

const fallbackAvatar = require("@/assets/images/landing/landing-9.jpg");

const formatDate = (value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - parsed.getFullYear();
  const m = now.getMonth() - parsed.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < parsed.getDate())) {
    age -= 1;
  }
  return age;
};

export default function ProfileScreen() {
  const [user, setUser] = useState<UserMe | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [avatarLocalUri, setAvatarLocalUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const [isAboutTruncated, setIsAboutTruncated] = useState(false);

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

  const profile = user?.profile;
  const displayName = useMemo(() => {
    const parts = [profile?.firstName, profile?.lastName].filter(Boolean);
    if (parts.length > 0) return parts.join(" ");
    return user?.pseudo || "Utilisateur";
  }, [profile?.firstName, profile?.lastName, user?.pseudo]);

  const age = formatDate(profile?.birthDate);
  const subtitle = profile?.instruments?.[0]?.instrument || "Guitariste";

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

  const instruments = (profile?.instruments ?? [])
    .map((item) =>
      item.level ? `${item.instrument} · ${item.level}` : item.instrument,
    )
    .filter(Boolean);

  const stylesMusicaux = (profile?.genres ?? []).filter(Boolean);

  return (
    <View style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <ImageBackground source={avatarSource} style={styles.hero}>
          <SafeAreaView>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.replace("/(tabs)/settings")}
            >
              <BackIcon
                width={22}
                height={22}
                style={{ transform: [{ scaleX: -1 }] }}
              />
            </TouchableOpacity>
          </SafeAreaView>
        </ImageBackground>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <View style={styles.titleBlock}>
              <Text style={styles.title}>
                {displayName}
                {age ? `, ${age}` : ""}
              </Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
            <TouchableOpacity style={styles.sendButton} activeOpacity={0.85}>
              <SendIcon width={20} height={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.locationRow}>
            <View>
              <Text style={styles.sectionTitle}>Localisation</Text>
              <Text style={styles.sectionValue}>
                {profile?.phoneNumber ? "Paris" : "Paris"}
              </Text>
            </View>
            <View style={styles.distancePill}>
              <PinIcon width={16} height={16} />
              <Text style={styles.distanceText}>1 km</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>A propos</Text>
            <Text
              style={styles.aboutText}
              numberOfLines={isAboutExpanded ? undefined : 4}
              onTextLayout={(event) => {
                if (isAboutExpanded) return;
                const hasMore = event.nativeEvent.lines.length > 4;
                if (hasMore !== isAboutTruncated) {
                  setIsAboutTruncated(hasMore);
                }
              }}
            >
              {profile?.bio?.trim().length
                ? profile.bio
                : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
            </Text>
            {profile?.bio?.trim().length && (isAboutTruncated || isAboutExpanded) ? (
              <TouchableOpacity
                onPress={() => setIsAboutExpanded((prev) => !prev)}
              >
                <Text style={styles.readMore}>
                  {isAboutExpanded ? "Lire moins." : "Lire plus."}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.readMore}>Lire plus.</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instruments</Text>
            <View style={styles.chipsRow}>
              {(instruments.length ? instruments : ["Guitare", "Piano", "Chant"]).map(
                (label) => (
                  <Chip key={label} label={label} />
                ),
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Styles musicaux</Text>
            <View style={styles.chipsRow}>
              {(stylesMusicaux.length ? stylesMusicaux : ["Jazz", "Blues"]).map(
                (label) => (
                  <Chip key={label} label={label} />
                ),
              )}
            </View>
          </View>

          <View style={[styles.section, { marginBottom: 40 }]}>
            <Text style={styles.sectionTitle}>Projets en ligne</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.projectsRow}
            >
              <View style={styles.projectCard}>
                <View style={styles.projectPlay} />
              </View>
              <View style={styles.projectCard}>
                <View style={styles.projectPlay} />
              </View>
              <View style={styles.projectCard}>
                <View style={styles.projectPlay} />
              </View>
            </ScrollView>
          </View>

          {loading && <Text style={styles.statusText}>Chargement...</Text>}
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      </ScrollView>
    </View>
  );
}

const Chip: React.FC<{ label: string }> = ({ label }) => (
  <View style={styles.chip}>
    <Text style={styles.chipText}>{label}</Text>
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
    paddingBottom: 140,
  },
  hero: {
    height: 420,
    justifyContent: "flex-start",
  },
  backButton: {
    marginTop: 8,
    marginLeft: 18,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  body: {
    marginTop: -22,
    borderTopWidth: 2,
    borderTopColor: Palette.primary,
    backgroundColor: Palette.bgBlack,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleBlock: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    ...Typography.title1Bold,
    color: Palette.bgWhite,
  },
  subtitle: {
    marginTop: 6,
    ...Typography.bodyMedium,
    color: Palette.grey300,
  },
  sendButton: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  locationRow: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    ...Typography.title3Bold,
    color: Palette.bgWhite,
  },
  sectionValue: {
    marginTop: 6,
    ...Typography.bodyMedium,
    color: Palette.grey300,
  },
  distancePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1D2329",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  distanceText: {
    ...Typography.bodyMedium,
    color: Palette.bgWhite,
  },
  aboutText: {
    marginTop: 10,
    ...Typography.bodyMedium,
    color: Palette.grey200,
    lineHeight: 22,
  },
  readMore: {
    marginTop: 8,
    ...Typography.bodyBold,
    color: Palette.bgWhite,
  },
  chipsRow: {
    marginTop: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  chip: {
    backgroundColor: Palette.bgWhite,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  chipText: {
    ...Typography.bodyMedium,
    color: Palette.grey800,
  },
  projectsRow: {
    marginTop: 16,
    gap: 12,
    paddingRight: 12,
  },
  projectCard: {
    width: 130,
    height: 130,
    borderRadius: 16,
    backgroundColor: "#0B0F14",
    alignItems: "center",
    justifyContent: "center",
  },
  projectPlay: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.bgWhite,
    opacity: 0.9,
  },
  statusText: {
    marginTop: 20,
    ...Typography.bodyMedium,
    color: Palette.grey300,
  },
  errorText: {
    marginTop: 10,
    ...Typography.bodyMedium,
    color: Palette.primary,
  },
});
