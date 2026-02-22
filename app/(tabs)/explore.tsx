import React, { useCallback, useEffect, useState } from "react";
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
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { LinearGradient } from "expo-linear-gradient";

import CloseIcon from "@/assets/icons/icons/close-outline-white.svg";
import PlayIcon from "@/assets/icons/icons/mdi-play-1.svg";
import StarIcon from "@/assets/icons/icons/shine-star.svg";
import { Palette, Typography } from "@/constants/theme";
import { discoverProfiles, dislikeUser, likeUser, MatchingProfile } from "@/lib/matching";
import { getAccessToken } from "@/lib/session";
import { Env } from "@/constants/env";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.28;
const EXIT_X = SCREEN_WIDTH * 1.2;

type SwipeDirection = "left" | "right";

const fallbackAvatar = require("@/assets/images/landing/landing-7.jpg");

function ExploreCard({ profile, token }: { profile: MatchingProfile; token?: string | null }) {
  const avatarUriBase =
    profile?.hasAvatar === false
      ? null
      : profile?.avatarUrl
        ? profile.avatarUrl
        : profile?.hasAvatar === true
          ? `${Env.API_URL}/user/profiles/${profile.userId}/avatar`
          : null;

  const avatarSource = avatarUriBase
    ? {
        uri: avatarUriBase,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }
    : fallbackAvatar;

  return (
    <View style={styles.card}>
      <View style={styles.cardInner}>
        <Image 
          source={avatarSource} 
          style={styles.cover}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>
        <View style={styles.progressTimes}>
          <Text style={styles.timeText}>0:15</Text>
          <Text style={styles.timeText}>0:45</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.playButton} activeOpacity={0.85}>
        <PlayIcon width={22} height={22} />
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

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

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

  const handleSwipeInteraction = useCallback(async (direction: SwipeDirection, profile: MatchingProfile) => {
    try {
      const sessionToken = await getAccessToken();
      if (!sessionToken) return;

      if (direction === "right") {
        const response = await likeUser(sessionToken, profile.userId);
        if (response.matched) {
          router.push({
            pathname: "/(match)/it-is-a-match",
            params: {
              matchId: response.matchId,
              targetUserId: profile.userId,
              targetName: profile.firstName || "Utilisateur",
            }
          });
        }
      } else {
        await dislikeUser(sessionToken, profile.userId);
      }
    } catch (err) {
      console.error(`[Explore] Failed to ${direction} user:`, err);
    }
  }, [router]);

  const moveToNextCard = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= profiles.length) {
      // Si plus de profils, on recharge
      fetchProfiles();
    } else {
      setCurrentIndex(nextIndex);
    }
    translateX.value = 0;
    translateY.value = 0;
  }, [currentIndex, profiles.length, fetchProfiles, translateX, translateY]);

  const triggerSwipe = useCallback(
    (direction: SwipeDirection) => {
      if (!currentProfile) return;

      const directionValue = direction === "right" ? 1 : -1;

      // Appel API en arrière-plan
      handleSwipeInteraction(direction, currentProfile);

      translateY.value = withTiming(0, { duration: 220 });
      translateX.value = withTiming(
        directionValue * EXIT_X,
        { duration: 220 },
        (finished) => {
          if (finished) {
            runOnJS(moveToNextCard)();
          }
        },
      );
    },
    [currentProfile, handleSwipeInteraction, moveToNextCard, translateX, translateY],
  );

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd(() => {
      if (Math.abs(translateX.value) > SWIPE_THRESHOLD) {
        const directionValue = translateX.value > 0 ? 1 : -1;
        const direction: SwipeDirection = translateX.value > 0 ? "right" : "left";

        if (currentProfile) {
          runOnJS(handleSwipeInteraction)(direction, currentProfile);
        }

        translateY.value = withTiming(0, { duration: 220 });
        translateX.value = withTiming(
          directionValue * EXIT_X,
          { duration: 220 },
          (finished) => {
            if (finished) {
              runOnJS(moveToNextCard)();
            }
          },
        );
        return;
      }

      translateX.value = withSpring(0, { damping: 14, stiffness: 170 });
      translateY.value = withSpring(0, { damping: 14, stiffness: 170 });
    });

  const swipeCardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-14, 0, 14],
      Extrapolation.CLAMP,
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const leftBadgeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  const rightBadgeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

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

  const avatarUriBase =
    currentProfile?.hasAvatar === false
      ? null
      : currentProfile?.avatarUrl
        ? currentProfile.avatarUrl
        : currentProfile?.hasAvatar === true
          ? `${Env.API_URL}/user/profiles/${currentProfile.userId}/avatar`
          : null;

  const userAvatarSource = avatarUriBase
    ? {
        uri: avatarUriBase,
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
              onPress={() => router.push(`/(settings)/user/${currentProfile.userId}`)}
            >
              <Image
                source={userAvatarSource}
                style={styles.userAvatar}
                transition={200}
                cachePolicy="memory-disk"
              />
              <Text style={styles.userText}>
                {currentProfile.firstName || currentProfile.userId.slice(0, 8)}, {currentProfile.distance?.toFixed(0) || 1}km
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cardDeck}>
            <GestureDetector gesture={panGesture}>
              <Animated.View style={swipeCardStyle}>
                <ExploreCard profile={currentProfile} token={token} />

                <Animated.View
                  style={[
                    styles.swipeBadge,
                    styles.swipeBadgeLeft,
                    leftBadgeStyle,
                  ]}
                >
                  <Text style={styles.swipeBadgeText}>NON</Text>
                </Animated.View>

                <Animated.View
                  style={[
                    styles.swipeBadge,
                    styles.swipeBadgeRight,
                    rightBadgeStyle,
                  ]}
                >
                  <Text style={styles.swipeBadgeText}>LIKE</Text>
                </Animated.View>
              </Animated.View>
            </GestureDetector>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.8}
              onPress={() => triggerSwipe("left")}
            >
              <CloseIcon width={22} height={22} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonPrimary]}
              activeOpacity={0.8}
              onPress={() => triggerSwipe("right")}
            >
              <StarIcon width={20} height={20} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

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
    borderRadius: 10,
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
  swipeBadge: {
    position: "absolute",
    top: 30,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  swipeBadgeLeft: {
    left: 20,
    borderColor: "#FF7474",
  },
  swipeBadgeRight: {
    right: 20,
    borderColor: "#7BE69A",
  },
  swipeBadgeText: {
    ...Typography.bodyBold,
    color: Palette.bgWhite,
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

