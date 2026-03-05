// components/landing/LandingSlide.tsx
import { LinearGradient } from "expo-linear-gradient";
import { Href, useRouter } from "expo-router";
import { FC } from "react";
import {
  ImageBackground,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ButtonLoop, TopNavButton } from "@/components/ui";
import { Palette, Typography } from "@/constants/theme";

interface LandingSlideProps {
  image: ImageSourcePropType;
  title: string;
  description: string;
  nextRoute: Href;
  skipRoute?: Href;
}

export const LandingSlide: FC<LandingSlideProps> = ({
  image,
  title,
  description,
  nextRoute,
  skipRoute = "/get-started" as Href,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleNext = () => {
    router.push(nextRoute);
  };

  const handleSkip = () => {
    router.replace(skipRoute);
  };

  return (
    <ImageBackground source={image} style={styles.background}>
      <LinearGradient
        colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.85)"]}
        style={styles.overlay}
      />

      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 24,
          },
        ]}
      >
        <View style={styles.topBar}>
          <View />
          <TopNavButton label="Passer" onPress={handleSkip} variant="text" />
        </View>

        <View style={styles.bottomContent}>
          <View style={styles.textBlock}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>

          <ButtonLoop
            label="Suivant"
            withArrow
            onPress={handleNext}
            style={{ marginTop: 12 }}
          />
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skipText: {
    ...Typography.smallSemibold,
    color: Palette.bgWhite,
  },
  bottomContent: {
    gap: 32,
  },
  textBlock: {
    gap: 16,
  },
  title: {
    ...Typography.title1Bold,
    color: Palette.bgWhite,
  },
  description: {
    ...Typography.bodyRegular,
    color: Palette.bgWhite,
  },
  ctaButton: {
    backgroundColor: Palette.primary,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: {
    ...Typography.bodyBold,
    color: Palette.bgWhite,
  },
});
