import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BackIcon from "@/assets/icons/icons/direction-left-2-outline-white.svg";
import EditIcon from "@/assets/icons/icons/edit-outline-white.svg";
import PinIcon from "@/assets/icons/icons/pin-outline-white.svg";
import PlayIcon from "@/assets/icons/icons/mdi-play-1.svg";
import { Env } from "@/constants/env";
import { Palette, Typography } from "@/constants/theme";
import { formatApiError } from "@/lib/api";
import { getAccessToken } from "@/lib/session";
import { getMyProfileDetails, UserProfile, getInstrumentLevelLabel } from "@/lib/user";
import { getMediaUrl } from "@/lib/media";
import { Audio } from "expo-av";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const fallbackAvatar = require("@/assets/images/landing/landing-9.jpg");

const PauseIcon = ({ width = 24, height = 24, color = "white" }: { width?: number; height?: number; color?: string }) => (
  <View style={{ width, height, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 3 }}>
    <View style={{ width: 4, height: 14, backgroundColor: color, borderRadius: 2 }} />
    <View style={{ width: 4, height: 14, backgroundColor: color, borderRadius: 2 }} />
  </View>
);

const calculateAge = (birthDate?: string | null) => {
  if (!birthDate) return null;
  const parsed = new Date(birthDate);
  if (Number.isNaN(parsed.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - parsed.getFullYear();
  const m = now.getMonth() - parsed.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < parsed.getDate())) {
    age -= 1;
  }
  return age;
};

export default function MyProfileContent() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const fetchProfileData = useCallback(async () => {
    setError(null);
    try {
      const sessionToken = await getAccessToken();
      if (!sessionToken) {
        setError("Tu dois être connecté pour voir ton profil.");
        setLoading(false);
        return;
      }
      setToken(sessionToken);
      const data = await getMyProfileDetails(sessionToken);
      setProfile(data);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const stopSound = async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
      setPlayingId(null);
    }
  };

  const handlePlaySound = async (mediaId: string, customUrl?: string) => {
    try {
      if (playingId === mediaId) {
        await stopSound();
        return;
      }
      if (sound) await stopSound();
      if (!token) return;

      const mediaUrl = customUrl 
        ? (customUrl.startsWith("http") ? customUrl : `${Env.API_URL}${customUrl}`)
        : getMediaUrl(mediaId);

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: mediaUrl, headers: { Authorization: `Bearer ${token}` } },
        { shouldPlay: true }
      );

      setSound(newSound);
      setPlayingId(mediaId);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingId(null);
          setSound(null);
        }
      });
    } catch (error) {
      console.error("Erreur lecture audio:", error);
      setError("Impossible de lire l'extrait audio.");
    }
  };

  useEffect(() => {
    return () => { if (sound) sound.unloadAsync(); };
  }, [sound]);

  useFocusEffect(
    useCallback(() => {
      fetchProfileData();
    }, [fetchProfileData])
  );

  const displayName = useMemo(() => {
    const parts = [profile?.firstName, profile?.lastName].filter(Boolean);
    if (parts.length > 0) return parts.join(" ");
    return profile?.pseudo || "Utilisateur";
  }, [profile]);

  const age = calculateAge(profile?.birthDate);

  const avatarSource = useMemo(() => {
    if (profile?.hasAvatar) {
      const cacheBreaker = profile.updatedAt ? `?v=${new Date(profile.updatedAt).getTime()}` : `?v=${Date.now()}`;
      return {
        uri: `${Env.API_URL}/user/me/avatar${cacheBreaker}`,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      };
    }
    if (profile?.avatarUrl) return { uri: profile.avatarUrl };
    return fallbackAvatar;
  }, [profile, token]);

  const instruments = useMemo(
    () => (profile?.instruments ?? []).map((item) =>
      item.level ? `${item.instrument} · ${getInstrumentLevelLabel(item.level)}` : item.instrument
    ),
    [profile?.instruments]
  );

  const genres = useMemo(() => (profile?.genres ?? []).filter(Boolean), [profile?.genres]);

  if (loading && !profile) {
    return (
      <View style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator size="large" color={Palette.primary} />
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.heroSection}>
          <Image
            source={avatarSource}
            style={styles.heroImage}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
          <LinearGradient
            colors={["rgba(1,12,19,0.3)", "transparent", Palette.bgBlack]}
            style={StyleSheet.absoluteFill}
          />

          <View style={[styles.headerActions, { top: insets.top + 12 }]}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
              <BackIcon width={24} height={24} style={{ transform: [{ scaleX: -1 }] }} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={() => router.push("/profile-edit")}
            >
              <EditIcon width={24} height={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.heroInfo}>
            <View style={styles.nameBlock}>
              <Text style={styles.nameText}>
                {displayName}{age ? `, ${age}` : ""}
              </Text>
            </View>
            <View style={styles.locationRow}>
              <PinIcon width={14} height={14} color={Palette.grey300} />
              <Text style={styles.locationText}>Mon Profil</Text>
            </View>
          </View>
        </View>

        <View style={styles.contentBody}>
          <View style={styles.infoCard}>
            <Text style={styles.sectionHeader}>À propos</Text>
            <Text style={styles.bioText} numberOfLines={isAboutExpanded ? undefined : 5}>
              {profile?.bio?.trim().length ? profile.bio : "Tu n'as pas encore rédigé ta biographie."}
            </Text>
            {profile?.bio && profile.bio.length > 180 && (
              <TouchableOpacity onPress={() => setIsAboutExpanded((prev) => !prev)} style={styles.expandButton}>
                <Text style={styles.expandButtonText}>{isAboutExpanded ? "Réduire" : "Lire la suite"}</Text>
              </TouchableOpacity>
            )}
          </View>

          {instruments.length > 0 && (
            <View style={styles.infoCard}>
              <Text style={styles.sectionHeader}>Instruments</Text>
              <View style={styles.tagGrid}>
                {instruments.map((label) => (
                  <View key={label} style={styles.tag}><Text style={styles.tagText}>{label}</Text></View>
                ))}
              </View>
            </View>
          )}

          {genres.length > 0 && (
            <View style={styles.infoCard}>
              <Text style={styles.sectionHeader}>Styles musicaux</Text>
              <View style={styles.tagGrid}>
                {genres.map((label) => (
                  <View key={label} style={[styles.tag, styles.tagSecondary]}>
                    <Text style={[styles.tagText, styles.tagTextSecondary]}>{label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {(profile?.media?.length || profile?.audio?.length) ? (
            <View style={styles.infoCard}>
              <Text style={styles.sectionHeader}>Mes extraits musicaux</Text>
              <View style={styles.mediaSection}>
                {profile.audio?.map((item) => (
                  <View key={item.id} style={styles.mediaRow}>
                    <TouchableOpacity style={styles.playButtonSmall} onPress={() => handlePlaySound(item.id, item.url)}>
                      {playingId === item.id ? <PauseIcon width={16} height={16} color={Palette.primary} /> : <PlayIcon width={20} height={20} color={Palette.bgWhite} />}
                    </TouchableOpacity>
                    <View style={styles.mediaInfo}>
                      <Text style={styles.mediaTitle} numberOfLines={1}>{item.title || "Extrait Audio"}</Text>
                      <Text style={styles.mediaSubtitle}>AUDIO</Text>
                    </View>
                  </View>
                ))}
                {profile.media?.filter(m => !profile.audio?.find(a => a.id === m.id)).map((item) => (
                  <View key={item.id} style={styles.mediaRow}>
                    <TouchableOpacity style={styles.playButtonSmall} onPress={() => handlePlaySound(item.id)}>
                      {playingId === item.id ? <PauseIcon width={16} height={16} color={Palette.primary} /> : <PlayIcon width={20} height={20} color={Palette.bgWhite} />}
                    </TouchableOpacity>
                    <View style={styles.mediaInfo}>
                      <Text style={styles.mediaTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.mediaSubtitle}>{item.type.toUpperCase()}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
          <View style={styles.footerSpacer} />
        </View>
      </ScrollView>
      {error && <View style={styles.errorBanner}><Text style={styles.errorText}>{error}</Text></View>}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Palette.bgBlack },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1 },
  contentContainer: { flexGrow: 1 },
  heroSection: { height: SCREEN_HEIGHT * 0.6, width: SCREEN_WIDTH, justifyContent: "flex-end" },
  heroImage: { ...StyleSheet.absoluteFillObject },
  headerActions: { position: "absolute", left: 20, right: 20, flexDirection: "row", justifyContent: "space-between", zIndex: 10 },
  iconButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(1,12,19,0.4)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  heroInfo: { paddingHorizontal: 24, paddingBottom: 24 },
  nameBlock: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 12 },
  nameText: { ...Typography.largeTitleBold, color: Palette.bgWhite, fontSize: 34 },
  locationRow: { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 6 },
  locationText: { ...Typography.bodyRegular, color: Palette.grey300, fontSize: 15 },
  contentBody: { backgroundColor: Palette.bgBlack, paddingHorizontal: 24, paddingTop: 8 },
  infoCard: { marginBottom: 20, backgroundColor: "rgba(255, 255, 255, 0.04)", padding: 20, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.06)" },
  sectionHeader: { ...Typography.bodyBold, color: Palette.bgWhite, marginBottom: 12, fontSize: 17, textTransform: "uppercase", letterSpacing: 1, opacity: 0.9 },
  bioText: { ...Typography.bodyRegular, color: Palette.grey300, lineHeight: 24, fontSize: 15 },
  expandButton: { marginTop: 10 },
  expandButtonText: { ...Typography.bodyBold, color: Palette.primary50, fontSize: 15 },
  tagGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tag: { backgroundColor: "rgba(221, 96, 49, 0.12)", borderWidth: 1, borderColor: "rgba(221, 96, 49, 0.3)", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14 },
  tagSecondary: { backgroundColor: "rgba(255, 255, 255, 0.06)", borderColor: "rgba(255, 255, 255, 0.12)" },
  tagText: { ...Typography.bodyMedium, color: Palette.primary50, fontSize: 14 },
  tagTextSecondary: { color: Palette.grey200 },
  mediaSection: { gap: 12 },
  mediaRow: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.05)", padding: 12, borderRadius: 16, gap: 12 },
  playButtonSmall: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  mediaInfo: { flex: 1 },
  mediaTitle: { ...Typography.bodyMedium, color: Palette.bgWhite, fontSize: 15 },
  mediaSubtitle: {
    ...Typography.smallLight,
    color: Palette.primary,
    fontSize: 11,
    marginTop: 2,
  },
  footerSpacer: { height: 100 },
  errorBanner: { position: "absolute", bottom: 40, left: 20, right: 20, backgroundColor: "rgba(238, 40, 59, 0.9)", padding: 16, borderRadius: 12 },
  errorText: { ...Typography.bodyMedium, color: Palette.bgWhite, textAlign: "center" },
});
