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
import CloseIcon from "@/assets/icons/icons/close-outline-white.svg";
import StarIcon from "@/assets/icons/icons/shine-star.svg";
import { Env } from "@/constants/env";
import { Palette, Typography } from "@/constants/theme";
import { formatApiError } from "@/lib/api";
import { getAccessToken, getStoredUser } from "@/lib/session";
import { getMyProfileDetails, getUserProfile, UserMe, UserProfile, getInstrumentLevelLabel } from "@/lib/user";
import { getMediaUrl } from "@/lib/media";
import { Audio } from "expo-av";
import { dislikeUser, likeUser, listMatches } from "@/lib/matching";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const fallbackAvatar = require("@/assets/images/landing/landing-9.jpg");

const PauseIcon = ({ width = 24, height = 24, color = "white" }: { width?: number; height?: number; color?: string }) => (
  <View style={{ width, height, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 3 }}>
    <View style={{ width: 4, height: 14, backgroundColor: color, borderRadius: 2 }} />
    <View style={{ width: 4, height: 14, backgroundColor: color, borderRadius: 2 }} />
  </View>
);

type ProfileScreenContentProps = {
  onBack: () => void;
  profileId?: string | null;
};

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

export default function ProfileScreenContent({
  onBack,
  profileId,
}: ProfileScreenContentProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<UserMe | null>(null);
  const [detailedProfile, setDetailedProfile] = useState<UserProfile | null>(null);
  const [me, setMe] = useState<{ id: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isMatched, setIsMatched] = useState(false);
  const [matchId, setMatchId] = useState<string | null>(null);

  // Détermine si c'est le profil de l'utilisateur connecté
  const isOwnProfile = useMemo(() => {
    if (profileId === "me" || !profileId) return true;
    if (user?.profile?.id === profileId) return true;
    if (me?.id === profileId) return true;
    return false;
  }, [profileId, me, user]);

  const fetchProfileData = useCallback(async () => {
    setError(null);
    try {
      const [sessionToken, storedUser] = await Promise.all([
        getAccessToken(),
        getStoredUser(),
      ]);

      if (!sessionToken) {
        setError("Tu dois être connecté pour voir ce profil.");
        setLoading(false);
        return;
      }

      setToken(sessionToken);
      setMe(storedUser);

      // Si c'est notre profil ou qu'on demande "me", on charge nos données détaillées
      if (
        profileId === "me" ||
        !profileId ||
        (storedUser && profileId === storedUser.id)
      ) {
        const data = await getMyProfileDetails(sessionToken);
        setDetailedProfile(data);
        // On remplit aussi l'objet "user" minimal pour la compatibilité
        setUser({ id: storedUser?.id || "", profile: data } as UserMe);
      } else {
        // Charger un profil public via l'ID
        const data = await getUserProfile(profileId, sessionToken);
        setDetailedProfile(data);
        setUser({ id: profileId, profile: data } as UserMe);

        // Vérifier si un match existe déjà
        const matches = await listMatches(sessionToken);
        const match = matches.find(m => m.profile.userId === profileId || m.profile.id === profileId);
        if (match) {
          setIsMatched(true);
          setMatchId(match.id);
        }
      }
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  const handleLike = async () => {
    if (!token || !profileId) return;
    try {
      const result = await likeUser(token, profileId);
      if (result.matched) {
        setIsMatched(true);
        setMatchId(result.matchId || null);
        // On pourrait ici rediriger vers l'écran It's a match ou juste rafraîchir
      } else {
        // Rediriger vers l'écran de découverte après le like si pas de match immédiat ?
        onBack();
      }
    } catch (err) {
      setError("Impossible de liker ce profil.");
    }
  };

  const handlePass = async () => {
    if (!token || !profileId) return;
    try {
      await dislikeUser(token, profileId);
      onBack(); // Retourner à l'écran de découverte
    } catch (err) {
      setError("Impossible de passer ce profil.");
    }
  };

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

      if (sound) {
        await stopSound();
      }

      if (!token) return;

      const mediaUrl = customUrl 
        ? (customUrl.startsWith("http") ? customUrl : `${Env.API_URL}${customUrl}`)
        : getMediaUrl(mediaId);

      const { sound: newSound } = await Audio.Sound.createAsync(
        { 
          uri: mediaUrl,
          headers: { Authorization: `Bearer ${token}` }
        },
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
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  useFocusEffect(
    useCallback(() => {
      fetchProfileData();
    }, [fetchProfileData])
  );

  const profile = user?.profile;
  const displayName = useMemo(() => {
    const parts = [profile?.firstName, profile?.lastName].filter(Boolean);
    if (parts.length > 0) return parts.join(" ");
    return user?.pseudo || "Utilisateur";
  }, [profile?.firstName, profile?.lastName, user?.pseudo]);

  const age = calculateAge(profile?.birthDate);
  const mainInstrument = profile?.instruments?.[0]?.instrument || "Musicien";

  // Logique de récupération de l'image corrigée
  const avatarSource = useMemo(() => {
    // Si hasAvatar est true, on utilise TOUJOURS l'endpoint officiel pour avoir la version à jour
    if (profile?.hasAvatar) {
      // Pour l'utilisateur actuel, on utilise l'endpoint dédié "me"
      // Pour les autres, on utilise l'endpoint public avec l'ID du profil
      const endpoint = isOwnProfile
        ? `${Env.API_URL}/user/me/avatar`
        : `${Env.API_URL}/user/profiles/${profileId}/avatar`;

      // Ajout d'un cache breaker basé sur updatedAt pour forcer le rafraîchissement
      const cacheBreaker = profile.updatedAt
        ? `?v=${new Date(profile.updatedAt).getTime()}`
        : `?v=${Date.now()}`; // Fallback if no updatedAt

      return {
        uri: `${endpoint}${cacheBreaker}`,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      };
    }

    // Fallback sur avatarUrl si disponible et pas de avatar géré par le back
    if (profile?.avatarUrl) return { uri: profile.avatarUrl };

    return fallbackAvatar;
  }, [profile, isOwnProfile, profileId, token]);

  const instruments = useMemo(
    () =>
      (profile?.instruments ?? []).map((item) =>
        item.level
          ? `${item.instrument} · ${getInstrumentLevelLabel(item.level)}`
          : item.instrument,
      ),
    [profile?.instruments],
  );

  const genres = useMemo(
    () => (profile?.genres ?? []).filter(Boolean),
    [profile?.genres],
  );

  if (loading && !user) {
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
                      <TouchableOpacity style={styles.iconButton} onPress={onBack}>
                        <BackIcon width={24} height={24} style={{ transform: [{ scaleX: -1 }] }} />
                      </TouchableOpacity>
                      
                      {isOwnProfile && (
                        <TouchableOpacity 
                          style={styles.iconButton} 
                          onPress={() => router.push("/profile-edit")}
                        >
                          <EditIcon width={24} height={24} />
                        </TouchableOpacity>
                      )}
                    </View>
                    <View style={styles.heroInfo}>
            <View style={styles.nameBlock}>
              <Text style={styles.nameText}>
                {displayName}
                {age ? `, ${age}` : ""}
              </Text>
            </View>

            <View style={styles.locationRow}>
              <PinIcon width={14} height={14} color={Palette.grey300} />
              <Text style={styles.locationText}>Paris, France</Text>
            </View>
          </View>
        </View>

        <View style={styles.contentBody}>
          {!isOwnProfile && (
            isMatched ? (
              <TouchableOpacity 
                style={styles.primaryButton} 
                activeOpacity={0.9}
                onPress={() => router.push(`/message/${matchId}`)}
              >
                <Text style={styles.primaryButtonText}>Envoyer un message</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.matchActionsRow}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  activeOpacity={0.8}
                  onPress={handlePass}
                >
                  <Text style={styles.secondaryButtonText}>PASSER</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.primaryButtonSmall}
                  activeOpacity={0.8}
                  onPress={handleLike}
                >
                  <Text style={styles.primaryButtonText}>LIKER</Text>
                </TouchableOpacity>
              </View>
            )
          )}

          <View style={styles.infoCard}>
            <Text style={styles.sectionHeader}>À propos</Text>
            <Text
              style={styles.bioText}
              numberOfLines={isAboutExpanded ? undefined : 5}
            >
              {profile?.bio?.trim().length
                ? profile.bio
                : "Ce musicien n'a pas encore rédigé sa biographie. Sa musique s'en chargera."}
            </Text>
            {profile?.bio && profile.bio.length > 180 && (
              <TouchableOpacity
                onPress={() => setIsAboutExpanded((prev) => !prev)}
                style={styles.expandButton}
              >
                <Text style={styles.expandButtonText}>
                  {isAboutExpanded ? "Réduire" : "Lire la suite"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {instruments.length > 0 && (
            <View style={styles.infoCard}>
              <Text style={styles.sectionHeader}>Instruments</Text>
              <View style={styles.tagGrid}>
                {instruments.map((label) => (
                  <View key={label} style={styles.tag}>
                    <Text style={styles.tagText}>{label}</Text>
                  </View>
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
                    <Text style={[styles.tagText, styles.tagTextSecondary]}>
                      {label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {((detailedProfile?.media && detailedProfile.media.length > 0) || (detailedProfile?.audio && detailedProfile.audio.length > 0)) && (
            <View style={styles.infoCard}>
              <Text style={styles.sectionHeader}>Extraits musicaux</Text>
              <View style={styles.mediaSection}>
                {/* Nouveau champ audio dédié */}
                {detailedProfile?.audio?.map((item) => (
                  <View key={item.id} style={styles.mediaRow}>
                    <TouchableOpacity 
                      style={styles.playButtonSmall} 
                      onPress={() => handlePlaySound(item.id, item.url)}
                    >
                      {playingId === item.id ? (
                        <PauseIcon width={16} height={16} color={Palette.primary} />
                      ) : (
                        <PlayIcon width={20} height={20} color={Palette.bgWhite} />
                      )}
                    </TouchableOpacity>
                    <View style={styles.mediaInfo}>
                      <Text style={styles.mediaTitle} numberOfLines={1}>{item.title || "Extrait Audio"}</Text>
                      <Text style={styles.mediaSubtitle}>AUDIO</Text>
                    </View>
                  </View>
                ))}

                {/* Champ media classique (images/videos ou audio fallback) */}
                {detailedProfile?.media?.filter(m => !detailedProfile.audio?.find(a => a.id === m.id)).map((item) => (
                  <View key={item.id} style={styles.mediaRow}>
                    <TouchableOpacity 
                      style={styles.playButtonSmall} 
                      onPress={() => handlePlaySound(item.id)}
                    >
                      {playingId === item.id ? (
                        <PauseIcon width={16} height={16} color={Palette.primary} />
                      ) : (
                        <PlayIcon width={20} height={20} color={Palette.bgWhite} />
                      )}
                    </TouchableOpacity>
                    <View style={styles.mediaInfo}>
                      <Text style={styles.mediaTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.mediaSubtitle}>{item.type.toUpperCase()}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.footerSpacer} />
        </View>
      </ScrollView>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.bgBlack,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  heroSection: {
    height: SCREEN_HEIGHT * 0.6,
    width: SCREEN_WIDTH,
    justifyContent: "flex-end",
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  headerActions: {
    position: "absolute",
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 10,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(1,12,19,0.4)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  heroInfo: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  nameBlock: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  nameText: {
    ...Typography.largeTitleBold,
    color: Palette.bgWhite,
    fontSize: 34,
  },
  instrumentBadge: {
    backgroundColor: Palette.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  instrumentBadgeText: {
    ...Typography.smallSemibold,
    color: Palette.bgWhite,
    fontSize: 12,
    textTransform: "uppercase",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 6,
  },
  locationText: {
    ...Typography.bodyRegular,
    color: Palette.grey300,
    fontSize: 15,
  },
  contentBody: {
    backgroundColor: Palette.bgBlack,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  primaryButton: {
    backgroundColor: Palette.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    shadowColor: Palette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    ...Typography.bodyBold,
    color: Palette.bgWhite,
    fontSize: 17,
  },
  matchActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 32,
    paddingTop: 8,
  },
  primaryButtonSmall: {
    flex: 1,
    backgroundColor: Palette.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Palette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#3B3F43",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    ...Typography.bodyBold,
    color: Palette.bgWhite,
    fontSize: 17,
  },
  infoCard: {
    marginBottom: 20,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  sectionHeader: {
    ...Typography.bodyBold,
    color: Palette.bgWhite,
    marginBottom: 12,
    fontSize: 17,
    textTransform: "uppercase",
    letterSpacing: 1,
    opacity: 0.9,
  },
  bioText: {
    ...Typography.bodyRegular,
    color: Palette.grey300,
    lineHeight: 24,
    fontSize: 15,
  },
  expandButton: {
    marginTop: 10,
  },
  expandButtonText: {
    ...Typography.bodyBold,
    color: Palette.primary50,
    fontSize: 15,
  },
  tagGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tag: {
    backgroundColor: "rgba(221, 96, 49, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(221, 96, 49, 0.3)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  tagSecondary: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  tagText: {
    ...Typography.bodyMedium,
    color: Palette.primary50,
    fontSize: 14,
  },
  tagTextSecondary: {
    color: Palette.grey200,
  },
  mediaSection: {
    gap: 12,
  },
  mediaRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 12,
    borderRadius: 16,
    gap: 12,
  },
  playButtonSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  mediaInfo: {
    flex: 1,
  },
  mediaTitle: {
    ...Typography.bodyMedium,
    color: Palette.bgWhite,
    fontSize: 15,
  },
  mediaSubtitle: {
    ...Typography.smallLight,
    color: Palette.grey400,
    fontSize: 11,
    marginTop: 2,
  },
  footerSpacer: {
    height: 100,
  },
  errorBanner: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: "rgba(238, 40, 59, 0.9)",
    padding: 16,
    borderRadius: 12,
  },
  errorText: {
    ...Typography.bodyMedium,
    color: Palette.bgWhite,
    textAlign: "center",
  },
});
