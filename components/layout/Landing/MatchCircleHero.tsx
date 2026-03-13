// components/layout/Landing/MatchCircleHero.tsx
import React, { memo } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { Image } from "expo-image";

type MatchCircleHeroProps = {
  style?: ViewStyle;
};

const IMAGE_SIZE = 300;

const MatchCircleHeroComponent = ({ style }: MatchCircleHeroProps) => {
  return (
    <View style={[styles.heroWrapper, style]}>
      <Image
        source={require("@/assets/images/landing/musicians.png")}
        style={styles.musiciansImage}
        contentFit="contain"
        cachePolicy="memory-disk"
        priority="high"
      />
    </View>
  );
};

export const MatchCircleHero = memo(MatchCircleHeroComponent);

const styles = StyleSheet.create({
  heroWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  musiciansImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
  },
});

export default MatchCircleHero;
