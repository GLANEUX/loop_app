import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Palette, Typography } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { getAccessToken, getStoredUser, StoredUser } from "@/lib/session";
import { Env } from "@/constants/env";

const fallbackAvatar = require("@/assets/images/landing/landing-1.jpg");

export default function ItIsAMatchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    matchId?: string;
    targetUserId?: string;
    targetName?: string;
  }>();

  const [me, setMe] = useState<StoredUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getAccessToken(), getStoredUser()]).then(([t, u]) => {
      setToken(t);
      setMe(u);
    });
  }, []);

  const targetName = params.targetName || "Musicien";
  
  const myAvatarUri = `${Env.API_URL}/user/me/avatar`;
  const partnerAvatarUri = params.targetUserId 
    ? `${Env.API_URL}/user/profiles/${params.targetUserId}/avatar`
    : null;

  return (
    <ImageBackground
      source={require("@/assets/images/landing/landing-25.png")}
      style={styles.container}
    >
      <LinearGradient
        colors={["rgba(0,0,0,0.4)", "rgba(0,0,0,0.8)", Palette.bgBlack]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.matchTitle}>C&apos;est un Match !</Text>
            <Text style={styles.matchSubtitle}>
              Toi et {targetName} avez flashé l&apos;un sur l&apos;autre.
            </Text>
          </View>

          <View style={styles.avatarsContainer}>
            <View style={[styles.avatarWrapper, styles.avatarLeft]}>
              <Image 
                source={token ? { uri: myAvatarUri, headers: { Authorization: `Bearer ${token}` } } : fallbackAvatar}
                style={styles.avatar}
              />
            </View>
            <View style={[styles.avatarWrapper, styles.avatarRight]}>
              <Image 
                source={partnerAvatarUri && token ? { uri: partnerAvatarUri, headers: { Authorization: `Bearer ${token}` } } : fallbackAvatar}
                style={styles.avatar}
              />
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                if (params.matchId) {
                  router.replace(`/message/${params.matchId}`);
                } else {
                  router.back();
                }
              }}
            >
              <Text style={styles.primaryButtonText}>Envoyer un message</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.back()}
            >
              <Text style={styles.secondaryButtonText}>Continuer à swiper</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.bgBlack,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 30,
    paddingVertical: 50,
  },
  header: {
    alignItems: "center",
    marginTop: 40,
  },
  matchTitle: {
    ...Typography.title1Bold,
    fontSize: 42,
    color: Palette.primary,
    textAlign: "center",
    textTransform: "uppercase",
  },
  matchSubtitle: {
    ...Typography.title3Bold,
    color: Palette.bgWhite,
    textAlign: "center",
    marginTop: 20,
    lineHeight: 28,
  },
  avatarsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 180,
  },
  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: Palette.bgWhite,
    overflow: "hidden",
    backgroundColor: "#1D2329",
  },
  avatarLeft: {
    marginRight: -20,
    zIndex: 1,
    transform: [{ rotate: "-10deg" }],
  },
  avatarRight: {
    marginLeft: -20,
    transform: [{ rotate: "10deg" }],
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  actions: {
    gap: 16,
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: Palette.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    ...Typography.bodyBold,
    color: Palette.bgWhite,
    fontSize: 18,
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: Palette.bgWhite,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  secondaryButtonText: {
    ...Typography.bodyBold,
    color: Palette.bgWhite,
    fontSize: 18,
  },
});
