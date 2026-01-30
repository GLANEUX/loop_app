import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BackIcon from "@/assets/icons/icons/arrow-right-outline-white.svg";
import { Palette, Typography } from "@/constants/theme";

const CHAT_DATA: Record<
  string,
  { name: string; status: string; avatar: any }
> = {
  abigail: {
    name: "Abigail",
    status: "En ligne il y a 8 heures",
    avatar: require("@/assets/images/landing/landing-1.jpg"),
  },
  elizabeth: {
    name: "Elizabeth",
    status: "En ligne il y a 2 heures",
    avatar: require("@/assets/images/landing/landing-2.jpg"),
  },
  emelie: {
    name: "Emelie",
    status: "En ligne il y a 1 heure",
    avatar: require("@/assets/images/landing/landing-7.jpg"),
  },
  penelope: {
    name: "Penelope",
    status: "En ligne il y a 20 minutes",
    avatar: require("@/assets/images/landing/landing-8.jpg"),
  },
  chloe: {
    name: "Chloe",
    status: "En ligne il y a 5 heures",
    avatar: require("@/assets/images/landing/landing-8.jpg"),
  },
  me: {
    name: "Moi",
    status: "En ligne",
    avatar: require("@/assets/images/landing/landing-9.jpg"),
  },
  emma: {
    name: "Emma",
    status: "En ligne il y a 1 heure",
    avatar: require("@/assets/images/landing/landing-3.jpg"),
  },
  ava: {
    name: "Ava",
    status: "En ligne il y a 3 heures",
    avatar: require("@/assets/images/landing/landing-4.jpg"),
  },
  sophia: {
    name: "Sophia",
    status: "En ligne il y a 4 heures",
    avatar: require("@/assets/images/landing/landing-5.jpg"),
  },
  bapt: {
    name: "Bapt",
    status: "En ligne il y a 6 heures",
    avatar: require("@/assets/images/landing/landing-6.jpg"),
  },
};

export default function MessageDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const chat = (id && CHAT_DATA[id]) || CHAT_DATA.abigail;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={router.back}>
          <BackIcon
            width={22}
            height={22}
            style={{ transform: [{ scaleX: -1 }] }}
          />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Image source={chat.avatar} style={styles.headerAvatar} />
          <View>
            <Text style={styles.headerName}>{chat.name}</Text>
            <Text style={styles.headerStatus}>{chat.status}</Text>
          </View>
        </View>
        <View style={styles.headerMenu} />
      </View>

      <View style={styles.headerDivider} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.bubble, styles.bubbleRight]}>
          <Text style={styles.bubbleText}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit consequat.
          </Text>
          <Text style={styles.timeText}>16.04</Text>
        </View>

        <View style={styles.bubbleLeft}>
          <Text style={styles.bubbleName}>John Doe</Text>
          <Text style={styles.bubbleTextDark}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi.
          </Text>
          <Text style={styles.timeTextDark}>16.04</Text>
        </View>

        <View style={styles.voiceBubble}>
          <View style={styles.voicePlay} />
          <View style={styles.voiceWave} />
          <Text style={styles.voiceTime}>0:05</Text>
          <View style={styles.voiceIcon} />
        </View>

        <View style={[styles.bubble, styles.bubbleRight]}>
          <Text style={styles.bubbleText}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua
          </Text>
          <Text style={styles.timeText}>16.04</Text>
        </View>
      </ScrollView>

      <View style={styles.inputBar}>
        <Text style={styles.inputPlaceholder}>Ecrire un message...</Text>
        <View style={styles.inputMic} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.bgBlack,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  headerName: {
    ...Typography.bodyBold,
    color: Palette.bgWhite,
  },
  headerStatus: {
    ...Typography.smallLight,
    color: Palette.grey300,
  },
  headerMenu: {
    width: 28,
    height: 28,
  },
  headerDivider: {
    height: 2,
    backgroundColor: Palette.primary,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 140,
    gap: 22,
  },
  bubble: {
    alignSelf: "flex-end",
    backgroundColor: Palette.primary,
    borderRadius: 18,
    padding: 16,
    maxWidth: "78%",
  },
  bubbleRight: {
    borderTopRightRadius: 6,
  },
  bubbleText: {
    ...Typography.bodyMedium,
    color: Palette.bgWhite,
  },
  timeText: {
    marginTop: 8,
    ...Typography.smallLight,
    color: Palette.bgWhite,
    textAlign: "right",
  },
  bubbleLeft: {
    alignSelf: "flex-start",
    backgroundColor: Palette.bgWhite,
    borderRadius: 18,
    padding: 16,
    maxWidth: "86%",
  },
  bubbleName: {
    ...Typography.bodyBold,
    color: Palette.black,
    marginBottom: 6,
  },
  bubbleTextDark: {
    ...Typography.bodyMedium,
    color: Palette.black,
  },
  timeTextDark: {
    marginTop: 8,
    ...Typography.smallLight,
    color: Palette.grey700,
    textAlign: "right",
  },
  voiceBubble: {
    alignSelf: "flex-start",
    backgroundColor: Palette.bgWhite,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  voicePlay: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Palette.primary,
  },
  voiceWave: {
    flex: 1,
    height: 12,
    backgroundColor: Palette.grey300,
    borderRadius: 6,
    minWidth: 120,
  },
  voiceTime: {
    ...Typography.bodyMedium,
    color: Palette.grey700,
  },
  voiceIcon: {
    width: 18,
    height: 18,
    backgroundColor: Palette.grey700,
    borderRadius: 9,
  },
  inputBar: {
    marginHorizontal: 24,
    marginBottom: 18,
    backgroundColor: Palette.bgWhite,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputPlaceholder: {
    ...Typography.bodyMedium,
    color: Palette.grey600,
  },
  inputMic: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Palette.black,
  },
});
