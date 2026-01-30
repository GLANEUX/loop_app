import { router } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Palette, Typography } from "@/constants/theme";

export default function MessagesTabScreen() {
  const friends = [
    {
      id: "emma",
      name: "Emma",
      image: require("@/assets/images/landing/landing-3.jpg"),
    },
    {
      id: "ava",
      name: "Ava",
      image: require("@/assets/images/landing/landing-4.jpg"),
    },
    {
      id: "sophia",
      name: "Sophia",
      image: require("@/assets/images/landing/landing-5.jpg"),
    },
    {
      id: "bapt",
      name: "Bapt",
      image: require("@/assets/images/landing/landing-6.jpg"),
    },
  ];

  const messages = [
    {
      id: "abigail",
      name: "Abigail",
      preview: "En train d’écrire...",
      time: "27 min",
      image: require("@/assets/images/landing/landing-1.jpg"),
    },
    {
      id: "elizabeth",
      name: "Elizabeth",
      preview: "Lorem Ipsum",
      time: "33 min",
      image: require("@/assets/images/landing/landing-2.jpg"),
    },
    {
      id: "emelie",
      name: "Emelie",
      preview: "Lorem Ipsum",
      time: "23 min",
      image: require("@/assets/images/landing/landing-7.jpg"),
    },
    {
      id: "penelope",
      name: "Penelope",
      preview: "Vous: Lorem Ipsum",
      time: "50 min",
      image: require("@/assets/images/landing/landing-8.jpg"),
    },
    {
      id: "chloe",
      name: "Chloe",
      preview: "Lorem Ipsum",
      time: "55 min",
      image: require("@/assets/images/landing/landing-8.jpg"),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Messages</Text>

        <Text style={styles.sectionTitle}>Matchs</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.friendsRow}
        >
          {friends.map((friend) => (
            <TouchableOpacity
              key={friend.id}
              style={styles.friendItem}
              onPress={() => router.push(`/(message)/${friend.id}`)}
              activeOpacity={0.85}
            >
              <Image source={friend.image} style={styles.friendAvatar} />
              <Text style={styles.friendName}>{friend.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Messages</Text>
        <View style={styles.messagesList}>
          {messages.map((message) => (
            <TouchableOpacity
              key={message.id}
              style={styles.messageRow}
              onPress={() => router.push(`/(message)/${message.id}`)}
              activeOpacity={0.85}
            >
              <Image source={message.image} style={styles.messageAvatar} />
              <View style={styles.messageBody}>
                <View style={styles.messageHeader}>
                  <Text style={styles.messageName}>{message.name}</Text>
                  <Text style={styles.messageTime}>{message.time}</Text>
                </View>
                <Text style={styles.messagePreview}>{message.preview}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.bgBlack,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 140,
  },
  title: {
    marginTop: 14,
    ...Typography.title1Bold,
    color: Palette.bgWhite,
  },
  sectionTitle: {
    marginTop: 22,
    ...Typography.title3Bold,
    color: Palette.bgWhite,
  },
  friendsRow: {
    marginTop: 16,
    gap: 16,
    paddingRight: 8,
  },
  friendItem: {
    alignItems: "center",
    width: 84,
  },
  friendAvatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  friendName: {
    marginTop: 10,
    ...Typography.bodyBold,
    color: Palette.bgWhite,
  },
  messagesList: {
    marginTop: 18,
    gap: 22,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  messageAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  messageBody: {
    flex: 1,
    gap: 6,
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  messageName: {
    ...Typography.bodyBold,
    color: Palette.bgWhite,
  },
  messageTime: {
    ...Typography.bodyMedium,
    color: Palette.grey600,
  },
  messagePreview: {
    ...Typography.bodyMedium,
    color: Palette.grey300,
  },
});
