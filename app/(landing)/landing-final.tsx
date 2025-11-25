// src/screens/OnboardingFirstMatchScreen.tsx
import { Palette } from "@/constants/theme";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  onStart?: () => void;
};

export const LandingFinal: React.FC<Props> = ({ onStart }) => {
  const insets = useSafeAreaInsets();

  const handleStartPress = () => {
    if (onStart) onStart();
    router.replace("/(auth)/authPage");
  };

  const handleRestart = () => {
    router.replace("/(landing)/landing-1");
  };

  return (
    <View
      style={[
        styles.safeArea,
        {
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 24,
        },
      ]}
    >
      <StatusBar barStyle="light-content" />

      {/* --- Bouton retour en haut --- */}
      <TouchableOpacity
        style={styles.backButtonContainer}
        onPress={handleRestart}
        activeOpacity={0.8}
      >
        <View style={styles.backButton}>
          <Text style={styles.backText}>Retour</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.container}>
        {/* --- Bloc illustration centrale --- */}
        <View style={styles.heroWrapper}>
          <View style={styles.dottedCircle}>
            <View style={styles.solidCircle}>
              <View style={styles.innerCircle}>
                <Image
                  source={require("@/assets/images/landing/landing-1.jpg")}
                  style={styles.mainArtistImage}
                />
              </View>
            </View>

            {/* Avatars */}
            <Image
              source={require("@/assets/images/landing/landing-2.jpg")}
              style={[styles.smallAvatar, styles.avatarTop]}
            />
            <Image
              source={require("@/assets/images/landing/landing-8.jpg")}
              style={[styles.smallAvatar, styles.avatarRight]}
            />
            <Image
              source={require("@/assets/images/landing/landing-7.jpg")}
              style={[styles.smallAvatar, styles.avatarBottom]}
            />
            <Image
              source={require("@/assets/images/landing/landing-6.jpg")}
              style={[styles.smallAvatar, styles.avatarLeft]}
            />
            <Image
              source={require("@/assets/images/landing/landing-5.jpg")}
              style={[styles.smallAvatar, styles.avatarDiagTopLeft]}
            />
            <Image
              source={require("@/assets/images/landing/landing-4.jpg")}
              style={[styles.smallAvatar, styles.avatarDiagBottomRight]}
            />
          </View>
        </View>

        {/* --- Texte --- */}
        <View style={styles.textBlock}>
          <Text style={styles.title} numberOfLines={2}>
            Trouves tes{"\n"}premiers matchs.
          </Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            Prêt·e à faire entendre ta{"\n"}musique ?
          </Text>
        </View>

        {/* --- Bouton CTA --- */}
        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={handleStartPress}
          >
            <Text style={styles.buttonLabel}>Commencer</Text>
            <Text style={styles.buttonArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const CIRCLE_SIZE = 260;
const SOLID_CIRCLE_SIZE = 200;
const INNER_CIRCLE_SIZE = 120;
const AVATAR_SIZE = 50;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.bgBlack,
  },

  /* --- Bouton retour --- */
  backButtonContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 50,
  },
  backButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  container: {
    flex: 1,
    backgroundColor: Palette.bgBlack,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },

  heroWrapper: {
    alignItems: "center",
    marginTop: 150,
  },
  dottedCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 2,
    borderColor: Palette.secondary50,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  solidCircle: {
    width: SOLID_CIRCLE_SIZE,
    height: SOLID_CIRCLE_SIZE,
    borderRadius: SOLID_CIRCLE_SIZE / 2,
    backgroundColor: Palette.secondary50,
    alignItems: "center",
    justifyContent: "center",
  },
  innerCircle: {
    width: INNER_CIRCLE_SIZE,
    height: INNER_CIRCLE_SIZE,
    borderRadius: INNER_CIRCLE_SIZE / 2,
    backgroundColor: Palette.secondary50,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  mainArtistImage: {
    width: INNER_CIRCLE_SIZE,
    height: INNER_CIRCLE_SIZE,
  },

  smallAvatar: {
    position: "absolute",
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },

  avatarTop: {
    top: -AVATAR_SIZE / 2 + 16,
    left: CIRCLE_SIZE / 2 - AVATAR_SIZE / 2,
  },
  avatarRight: {
    right: -AVATAR_SIZE / 2 + 16,
    top: CIRCLE_SIZE / 2 - AVATAR_SIZE / 2,
  },
  avatarBottom: {
    bottom: -AVATAR_SIZE / 2 + 16,
    left: CIRCLE_SIZE / 2 - AVATAR_SIZE / 2,
  },
  avatarLeft: {
    left: -AVATAR_SIZE / 2 + 16,
    top: CIRCLE_SIZE / 2 - AVATAR_SIZE / 2,
  },
  avatarDiagTopLeft: {
    top: 24,
    left: 24,
  },
  avatarDiagBottomRight: {
    bottom: 24,
    right: 24,
  },

  textBlock: {
    alignItems: "center",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 32,
    marginBottom: 12,
  },
  subtitle: {
    color: "#E5E7EB",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },

  buttonWrapper: {
    width: "100%",
  },
  primaryButton: {
    backgroundColor: "#DD6031",
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonArrow: {
    color: "#FFFFFF",
    fontSize: 20,
    marginLeft: 4,
  },
});

export default LandingFinal;
