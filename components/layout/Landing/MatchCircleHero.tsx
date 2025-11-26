// src/components/Landing/MatchCircleHero.tsx
import { Palette } from "@/constants/theme";
import React from "react";
import { Image, StyleSheet, View, ViewStyle } from "react-native";

type MatchCircleHeroProps = {
  style?: ViewStyle;
};

const CIRCLE_SIZE = 260;
const SOLID_CIRCLE_SIZE = 200;
const INNER_CIRCLE_SIZE = 120;
const AVATAR_SIZE = 50;

export const MatchCircleHero: React.FC<MatchCircleHeroProps> = ({ style }) => {
  return (
    <View style={[styles.heroWrapper, style]}>
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
  );
};

const styles = StyleSheet.create({
  heroWrapper: {
    alignItems: "center",
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
});

export default MatchCircleHero;
