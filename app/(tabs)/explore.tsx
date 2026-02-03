import React, { useCallback, useState } from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { scheduleOnRN } from "react-native-worklets";

import CloseIcon from "@/assets/icons/icons/close-outline-white.svg";
import PlayIcon from "@/assets/icons/icons/mdi-play-1.svg";
import StarIcon from "@/assets/icons/icons/shine-star.svg";
import { Palette, Typography } from "@/constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.28;
const EXIT_X = SCREEN_WIDTH * 1.2;

type SwipeDirection = "left" | "right";

type ExploreCardData = {
  id: string;
  name: string;
  distance: string;
  coverImage: ImageSourcePropType;
};

const EXPLORE_CARDS: ExploreCardData[] = [
  {
    id: "mathis",
    name: "Mathis",
    distance: "5km",
    coverImage: require("@/assets/images/landing/landing-7.jpg"),
  },
  {
    id: "ines",
    name: "Ines",
    distance: "3km",
    coverImage: require("@/assets/images/landing/landing-8.jpg"),
  },
  {
    id: "leo",
    name: "Leo",
    distance: "7km",
    coverImage: require("@/assets/images/landing/landing-5.jpg"),
  },
];

function ExploreCard({ coverImage }: { coverImage: ImageSourcePropType }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardInner}>
        <Image source={coverImage} style={styles.cover} />
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const currentCard = EXPLORE_CARDS[currentIndex];

  const moveToNextCard = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % EXPLORE_CARDS.length);
    translateX.value = 0;
    translateY.value = 0;
  }, [translateX, translateY]);

  const triggerSwipe = useCallback(
    (direction: SwipeDirection) => {
      const directionValue = direction === "right" ? 1 : -1;
      translateY.value = withTiming(0, { duration: 220 });
      translateX.value = withTiming(
        directionValue * EXIT_X,
        { duration: 220 },
        (finished) => {
          if (finished) {
            scheduleOnRN(moveToNextCard);
          }
        },
      );
    },
    [moveToNextCard, translateX, translateY],
  );

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd(() => {
      if (Math.abs(translateX.value) > SWIPE_THRESHOLD) {
        const directionValue = translateX.value > 0 ? 1 : -1;
        translateY.value = withTiming(0, { duration: 220 });
        translateX.value = withTiming(
          directionValue * EXIT_X,
          { duration: 220 },
          (finished) => {
            if (finished) {
              scheduleOnRN(moveToNextCard);
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
              onPress={() => router.push(`/(settings)/user/${currentCard.id}`)}
            >
              <Image
                source={currentCard.coverImage}
                style={styles.userAvatar}
              />
              <Text style={styles.userText}>
                {currentCard.name}, {currentCard.distance}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cardDeck}>
            <GestureDetector gesture={panGesture}>
              <Animated.View style={swipeCardStyle}>
                <ExploreCard coverImage={currentCard.coverImage} />

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
  bellButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
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
  profileChip: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  profileChipText: {
    ...Typography.smallLight,
    color: Palette.black,
  },
  cover: {
    width: 170,
    height: 170,
    borderRadius: 10,
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
});
