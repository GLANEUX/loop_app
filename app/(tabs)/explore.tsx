import React from "react";
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BellIcon from "@/assets/icons/icons/notification-2-outline-white.svg";
import CloseIcon from "@/assets/icons/icons/close-outline-white.svg";
import PlayIcon from "@/assets/icons/icons/mdi-play-1.svg";
import StarIcon from "@/assets/icons/icons/shine-star.svg";
import { Palette, Typography } from "@/constants/theme";

export default function ExploreTabScreen() {
  return (
    <ImageBackground
      source={require("@/assets/images/landing/landing-2.jpg")}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.overlay} />

        <View style={styles.content}>
          <View style={styles.topRow}>
            <View style={styles.userPill}>
              <Image
                source={require("@/assets/images/landing/landing-6.jpg")}
                style={styles.userAvatar}
              />
              <Text style={styles.userText}>Mathis, 5km</Text>
            </View>
            <TouchableOpacity style={styles.bellButton} activeOpacity={0.8}>
              <BellIcon width={22} height={22} />
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <View style={styles.cardInner}>
              <TouchableOpacity style={styles.profileChip} activeOpacity={0.8}>
                <Text style={styles.profileChipText}>Voir le profil</Text>
              </TouchableOpacity>
              <Image
                source={require("@/assets/images/landing/landing-7.jpg")}
                style={styles.cover}
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

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
              <CloseIcon width={22} height={22} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonPrimary]}
              activeOpacity={0.8}
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
  card: {
    backgroundColor: "rgba(0,0,0,0.65)",
    borderRadius: 26,
    padding: 16,
    gap: 16,
  },
  cardInner: {
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 18,
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
