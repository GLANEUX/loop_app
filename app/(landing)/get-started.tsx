// app/(landing)/get-started.tsx
import { MatchCircleHero } from "@/components/layout";
import { ButtonLoop, TopNavButton } from "@/components/ui";
import { Palette, Typography } from "@/constants/theme";
import { router } from "expo-router";
import React from "react";
import { StatusBar, StyleSheet, View, Text, ScrollView } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const LandingFinal: React.FC = () => {
  const insets = useSafeAreaInsets();

  const handleStartPress = () => {
    router.push("/authPage");
  };

  const handleRestart = () => {
    router.replace("/discover-musicians");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background Image & Overlay */}
      <View style={StyleSheet.absoluteFill}>
        <Image
          source={require("@/assets/images/auth/login-landing.jpg")}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          priority="high"
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.4)", "rgba(0,0,0,0.7)", Palette.bgBlack]}
          locations={[0, 0.5, 0.9]}
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
        removeClippedSubviews={true}
      >
        <View>
          <TopNavButton
            label="Retour"
            onPress={handleRestart}
            variant="text"
          />
        </View>

        <View style={styles.mainContent}>
          <View style={styles.heroContainer}>
            <MatchCircleHero />
          </View>

          <View style={styles.textBlock}>
            <Text style={styles.title}>
              Trouve tes{"\n"}premiers matchs.
            </Text>
            <Text style={styles.subtitle}>
              Prêt·e à faire entendre ta musique ?{"\n"}La scène n&apos;attend que toi.
            </Text>
          </View>
        </View>

        <View>
          <ButtonLoop
            label="Commencer l'aventure"
            withArrow
            onPress={handleStartPress}
          />
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
    paddingHorizontal: 28,
    justifyContent: "space-between",
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 40,
    marginVertical: 40,
  },
  heroContainer: {
    width: "100%",
    alignItems: "center",
  },
  textBlock: {
    alignItems: "center",
    gap: 12,
  },
  title: {
    ...Typography.title1Bold,
    color: Palette.bgWhite,
    textAlign: "center",
    fontSize: 38,
    lineHeight: 46,
  },
  subtitle: {
    ...Typography.bodyRegular,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    fontSize: 17,
    lineHeight: 26,
  },
});

export default LandingFinal;
