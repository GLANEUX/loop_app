// components/layout/Landing/LandingSlide.tsx
import { LinearGradient } from "expo-linear-gradient";
import { Href, useRouter } from "expo-router";
import { FC } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { 
  FadeInDown, 
  FadeIn
} from "react-native-reanimated";

import { ButtonLoop, TopNavButton } from "@/components/ui";
import { Palette, Typography } from "@/constants/theme";

interface LandingSlideProps {
  image: any;
  title: string;
  description: string;
  nextRoute: Href;
  skipRoute?: Href;
  showBack?: boolean;
}

export const LandingSlide: FC<LandingSlideProps> = ({
  image,
  title,
  description,
  nextRoute,
  skipRoute = "/get-started" as Href,
  showBack = false,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleNext = () => {
    router.push(nextRoute);
  };

  const handleSkip = () => {
    router.replace(skipRoute);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Background Image with expo-image for better perf & caching */}
      <View style={StyleSheet.absoluteFill}>
        <Image
          source={image}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.2)", "rgba(0,0,0,0.5)", "rgba(0,0,0,0.95)"]}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <ScrollView 
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.delay(100).duration(400)} style={styles.topBar}>
          {showBack ? (
            <TopNavButton label="Retour" onPress={handleBack} variant="text" />
          ) : (
            <View />
          )}
          <TopNavButton label="Passer" onPress={handleSkip} variant="text" />
        </Animated.View>

        <View style={styles.bottomContent}>
          <View style={styles.textBlock}>
            <Animated.Text 
              entering={FadeInDown.delay(200).duration(600)}
              style={styles.title}
            >
              {title}
            </Animated.Text>
            <Animated.Text 
              entering={FadeInDown.delay(400).duration(600)}
              style={styles.description}
            >
              {description}
            </Animated.Text>
          </View>

          <Animated.View entering={FadeInDown.delay(600).duration(600).springify()}>
            <ButtonLoop
              label="Suivant"
              withArrow
              onPress={handleNext} 
              style={{ marginTop: 12 }}
            />
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.bgBlack,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bottomContent: {
    gap: 32,
    marginBottom: 20,
    marginTop: 40,
  },
  textBlock: {
    gap: 16,
  },
  title: {
    ...Typography.title1Bold,
    color: Palette.bgWhite,
    fontSize: 36,
    lineHeight: 44,
  },
  description: {
    ...Typography.bodyRegular,
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 17,
    lineHeight: 26,
  },
});
