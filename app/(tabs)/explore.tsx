import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { LinearGradient } from "expo-linear-gradient";

import CloseIcon from "@/assets/icons/icons/close-outline-white.svg";
import PlayIcon from "@/assets/icons/icons/mdi-play-1.svg";
import StarIcon from "@/assets/icons/icons/shine-star.svg";
import { Palette, Typography } from "@/constants/theme";
import { discoverProfiles, dislikeUser, likeUser, MatchingProfile } from "@/lib/matching";
import { getAccessToken } from "@/lib/session";
import { Env } from "@/constants/env";

import { Audio, AVPlaybackStatus } from "expo-av";
import { getMediaUrl } from "@/lib/media";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const fallbackAvatar = require("@/assets/images/landing/landing-7.jpg");

const PauseIcon = ({ width = 24, height = 24, color = "white" }: { width?: number; height?: number; color?: string }) => (
  <View style={{ width, height, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 3 }}>
    <View style={{ width: 4, height: 14, backgroundColor: color, borderRadius: 2 }} />
    <View style={{ width: 4, height: 14, backgroundColor: color, borderRadius: 2 }} />
  </View>
);

function formatTime(millis: number) {
  const totalSeconds = millis / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

function ExploreCard({ 
  profile, 
  token,
  onPressImage
}: { 
  profile: MatchingProfile; 
  token?: string | null;
  onPressImage?: () => void;
}) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  const firstAudio = useMemo(() => {
    if (profile.audio && profile.audio.length > 0) {
      return profile.audio[0];
    }
    return profile.media?.find((m) => m.type === "audio");
  }, [profile.audio, profile.media]);

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
      }
    }
  };

  const handlePlayPause = async () => {
    try {
      if (!firstAudio) return;
      if (!token) return;

      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
        } else {
          await sound.playAsync();
        }
        return;
      }

      const mediaUrl = "url" in firstAudio && firstAudio.url 
        ? (firstAudio.url.startsWith("http") ? firstAudio.url : `${Env.API_URL}${firstAudio.url}`)
        : getMediaUrl(firstAudio.id);

      const { sound: newSound } = await Audio.Sound.createAsync(
        { 
          uri: mediaUrl,
          headers: { Authorization: `Bearer ${token}` }
        },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
    } catch (error) {
      console.error("[ExploreCard] Error playing discover audio:", error);
    }
  };

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  useEffect(() => {
    if (sound) {
      sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
      setPosition(0);
      setDuration(0);
    }
  }, [profile.userId]);

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  const avatarUriBase =
    profile?.hasAvatar === false
      ? null
      : profile?.avatarUrl
        ? profile.avatarUrl
        : profile?.hasAvatar === true
          ? `${Env.API_URL}/user/profiles/${profile.userId}/avatar`
          : null;

  const cacheBreaker = profile?.updatedAt
    ? `?v=${new Date(profile.updatedAt).getTime()}`
    : "";

  const avatarSource = avatarUriBase
    ? {
        uri: `${avatarUriBase}${avatarUriBase.includes("?") ? "&" : "?"}${cacheBreaker}`.replace(/[?&]$/, ""),
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }
    : fallbackAvatar;

  return (
    <View style={styles.card}>
      <TouchableOpacity 
        style={styles.cardInner} 
        activeOpacity={0.9} 
        onPress={onPressImage}
      >
        <Image 
          source={avatarSource} 
          style={styles.cover}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={StyleSheet.absoluteFill}
        />
      </TouchableOpacity>

      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <View style={styles.progressTimes}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.playButton} 
        activeOpacity={0.85}
        onPress={handlePlayPause}
        disabled={!firstAudio}
      >
        {isPlaying ? (
          <PauseIcon width={24} height={24} color="white" />
        ) : (
          <PlayIcon width={22} height={22} />
        )}
      </TouchableOpacity>
    </View>
  );
}

export default function ExploreTabScreen() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<MatchingProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentProfile = profiles[currentIndex];

  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true);
      const sessionToken = await getAccessToken();
      if (!sessionToken) {
        setError("Session expirée");
        return;
      }
      setToken(sessionToken);
      const data = await discoverProfiles(sessionToken);
      setProfiles(data);
      setCurrentIndex(0);

      if (data.length > 0) {
        const uris = data.map(p => {
          if (p.avatarUrl) return p.avatarUrl;
          if (p.hasAvatar) return `${Env.API_URL}/user/profiles/${p.userId}/avatar`;
          return null;
        }).filter(Boolean) as string[];
        
        void Image.prefetch(uris);
      }
    } catch (err) {
      console.error("[Explore] Failed to fetch profiles:", err);
      setError("Impossible de charger les profils");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleAction = useCallback(async (direction: SwipeDirection) => {
    if (!currentProfile) return;
    
    const profileToProcess = currentProfile;
    
    // Move to next card immediately (no timeout, no animation)
    const nextIndex = currentIndex + 1;
    if (nextIndex >= profiles.length) {
      fetchProfiles();
    } else {
      setCurrentIndex(nextIndex);
    }

    try {
      const sessionToken = await getAccessToken();
      if (!sessionToken) return;

      if (direction === "right") {
        const response = await likeUser(sessionToken, profileToProcess.userId);
        if (response.matched) {
          router.push({
            pathname: "/it-is-a-match",
            params: {
              matchId: response.matchId,
              targetUserId: profileToProcess.userId,
              targetName: profileToProcess.firstName || "Utilisateur",
            }
          });
        }
      } else {
        await dislikeUser(sessionToken, profileToProcess.userId);
      }
    } catch (err) {
      console.error(`[Explore] Failed to process ${direction}:`, err);
    }
  }, [currentProfile, currentIndex, profiles.length, fetchProfiles, router]);

  if (loading && profiles.length === 0) {
    return (
      <View style={[styles.background, styles.centered]}>
        <ActivityIndicator size="large" color={Palette.primary} />
      </View>
    );
  }

  if (error && profiles.length === 0) {
    return (
      <View style={[styles.background, styles.centered]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProfiles}>
          <Text style={styles.retryText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (profiles.length === 0 || !currentProfile) {
    return (
      <View style={[styles.background, styles.centered]}>
        <Text style={styles.emptyText}>Plus de profils pour le moment...</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProfiles}>
          <Text style={styles.retryText}>Actualiser</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const avatarUriBaseTab =
    currentProfile?.hasAvatar === false
      ? null
      : currentProfile?.avatarUrl
        ? currentProfile.avatarUrl
        : currentProfile?.hasAvatar === true
          ? `${Env.API_URL}/user/profiles/${currentProfile.userId}/avatar`
          : null;

  const cacheBreakerTab = currentProfile?.updatedAt
    ? `?v=${new Date(currentProfile.updatedAt).getTime()}`
    : "";

  const userAvatarSource = avatarUriBaseTab
    ? {
        uri: `${avatarUriBaseTab}${avatarUriBaseTab.includes("?") ? "&" : "?"}${cacheBreakerTab}`.replace(/[?&]$/, ""),
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }
    : fallbackAvatar;

  return (
    <ImageBackground
      source={require("@/assets/images/landing/landing-25.png")}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.overlay} />

        <View style={styles.content}>
          <View style={styles.topRow}>
            <TouchableOpacity
              style={styles.userPill}
              activeOpacity={0.85}
              onPress={() => router.push(`/user/${currentProfile.userId}`)}
            >
              <Image
                source={userAvatarSource}
                style={styles.userAvatar}
                cachePolicy="memory-disk"
              />
              <Text style={styles.userText}>
                {currentProfile.firstName || currentProfile.userId.slice(0, 8)}, {currentProfile.distance?.toFixed(0) || 1}km
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cardDeck}>
            <View>
              <ExploreCard 
                profile={currentProfile} 
                token={token} 
                onPressImage={() => router.push(`/user/${currentProfile.userId}`)}
              />
            </View>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.8}
              onPress={() => handleAction("left")}
            >
              <CloseIcon width={22} height={22} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonPrimary]}
              activeOpacity={0.8}
              onPress={() => handleAction("right")}
            >
              <StarIcon width={20} height={20} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

type SwipeDirection = "left" | "right";

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: Palette.bgBlack,
  },
  backgroundImage: {
    resizeMode: "cover",
  },
  safeArea: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 120,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 8,
  },
  userAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  userText: {
    ...Typography.smallLight,
    color: Palette.black,
  },
  cardDeck: {
    height: 390,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "rgba(0,0,0,0.65)",
    borderRadius: 26,
    padding: 16,
    gap: 16,
  },
  cardInner: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cover: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "#1D2329",
  },
  progressRow: {
    gap: 6,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.15)",
    overflow: "hidden",
  },
  progressFill: {
    width: "45%",
    height: "100%",
    borderRadius: 999,
    backgroundColor: Palette.primary,
  },
  progressTimes: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeText: {
    ...Typography.smallLight,
    color: Palette.grey200,
  },
  playButton: {
    alignSelf: "center",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Palette.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  actionButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#3B3F43",
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonPrimary: {
    backgroundColor: Palette.primary,
  },
  emptyText: {
    ...Typography.bodyMedium,
    color: Palette.grey300,
    marginBottom: 20,
  },
  errorText: {
    ...Typography.bodyMedium,
    color: Palette.primary,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Palette.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: {
    ...Typography.bodyBold,
    color: Palette.bgWhite,
  },
});

