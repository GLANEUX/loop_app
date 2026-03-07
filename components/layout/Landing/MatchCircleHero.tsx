// components/layout/Landing/MatchCircleHero.tsx
import { Palette } from "@/constants/theme";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { Image } from "expo-image";

type MatchCircleHeroProps = {
  style?: ViewStyle;
};

const CIRCLE_SIZE = 260;
const SOLID_CIRCLE_SIZE = 200;
const INNER_CIRCLE_SIZE = 120;
const AVATAR_SIZE = 54;

const StaticAvatar = ({ 
  source, 
  style, 
}: { 
  source: any, 
  style: any, 
}) => (
  <Image
    source={source}
    style={[styles.smallAvatar, style]}
    contentFit="cover"
    cachePolicy="memory-disk"
    placeholder="L025_#00000000"
  />
);

export const MatchCircleHero: React.FC<MatchCircleHeroProps> = ({ style }) => {
  return (
    <View style={[styles.heroWrapper, style]}>
      <View style={styles.dottedCircle}>
        <View style={styles.solidCircle}>
          <View style={styles.innerCircle}>
            <Image
              source={require("@/assets/images/landing/landing-1.jpg")}
              style={styles.mainArtistImage}
              contentFit="cover"
              cachePolicy="memory-disk"
              placeholder="L025_#00000000"
            />
          </View>
        </View>

        {/* 6 static avatars - Scattered layout with zero performance cost */}
        <StaticAvatar 
          source={require("@/assets/images/landing/landing-2.jpg")} 
          style={styles.avatarTop} 
        />
        <StaticAvatar 
          source={require("@/assets/images/landing/landing-8.jpg")} 
          style={styles.avatarRight} 
        />
        <StaticAvatar 
          source={require("@/assets/images/landing/landing-7.jpg")} 
          style={styles.avatarBottom} 
        />
        <StaticAvatar 
          source={require("@/assets/images/landing/landing-6.jpg")} 
          style={styles.avatarLeft} 
        />
        <StaticAvatar 
          source={require("@/assets/images/landing/landing-5.jpg")} 
          style={styles.avatarDiagTopLeft} 
        />
        <StaticAvatar 
          source={require("@/assets/images/landing/landing-4.jpg")} 
          style={styles.avatarDiagBottomRight} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroWrapper: {
    alignItems: "center",
    justifyContent: "center",
    height: CIRCLE_SIZE + 40,
  },
  dottedCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 2,
    borderColor: "rgba(221, 96, 49, 0.3)", 
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  solidCircle: {
    width: SOLID_CIRCLE_SIZE,
    height: SOLID_CIRCLE_SIZE,
    borderRadius: SOLID_CIRCLE_SIZE / 2,
    backgroundColor: "rgba(221, 96, 49, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(221, 96, 49, 0.2)",
  },
  innerCircle: {
    width: INNER_CIRCLE_SIZE,
    height: INNER_CIRCLE_SIZE,
    borderRadius: INNER_CIRCLE_SIZE / 2,
    backgroundColor: Palette.bgBlack,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 3,
    borderColor: Palette.primary,
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
    borderWidth: 2,
    borderColor: Palette.bgWhite,
    backgroundColor: "#1D2329",
  },

  avatarTop: {
    top: -AVATAR_SIZE / 2,
    left: CIRCLE_SIZE / 2 - AVATAR_SIZE / 2,
  },
  avatarRight: {
    right: -AVATAR_SIZE / 2,
    top: CIRCLE_SIZE / 2 - AVATAR_SIZE / 2,
  },
  avatarBottom: {
    bottom: -AVATAR_SIZE / 2,
    left: CIRCLE_SIZE / 2 - AVATAR_SIZE / 2,
  },
  avatarLeft: {
    left: -AVATAR_SIZE / 2,
    top: CIRCLE_SIZE / 2 - AVATAR_SIZE / 2,
  },
  avatarDiagTopLeft: {
    top: 20,
    left: 20,
  },
  avatarDiagBottomRight: {
    bottom: 20,
    right: 20,
  },
});

export default MatchCircleHero;
