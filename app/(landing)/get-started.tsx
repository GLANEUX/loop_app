// app/landing-final.tsx
import { MatchCircleHero } from "@/components/layout";
import { ButtonLoop, TopNavButton } from "@/components/ui";
import { Palette, Typography } from "@/constants/theme";
import { router } from "expo-router";
import React from "react";
import { StatusBar, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  onStart?: () => void;
};

export const LandingFinal: React.FC<Props> = ({ onStart }) => {
  const insets = useSafeAreaInsets();

  const handleStartPress = () => {
    if (onStart) onStart();
    router.replace("/authPage");
  };

  const handleRestart = () => {
    router.replace("/discover-musicians");
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

      <TopNavButton
        label="Retour"
        onPress={handleRestart}
        variant="pill"
        style={styles.backButtonContainer}
      />

      <View style={styles.container}>
        <MatchCircleHero style={styles.heroMargin} />

        <View style={styles.textBlock}>
          <Text style={styles.title} numberOfLines={2}>
            Trouves tes{"\n"}premiers matchs.
          </Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            Prêt·e à faire entendre ta{"\n"}musique ?
          </Text>
        </View>

        <ButtonLoop
          label="Commencer"
          withArrow
          onPress={handleStartPress}
          style={{ marginTop: 12 }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.bgBlack,
  },

  backButtonContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 50,
  },

  container: {
    flex: 1,
    backgroundColor: Palette.bgBlack,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },

  heroMargin: {
    marginTop: 100,
  },

  textBlock: {
    alignItems: "center",
  },
  title: {
    ...Typography.title1Bold,
    color: Palette.bgWhite,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    ...Typography.bodyRegular,
    color: Palette.bgWhite,
    textAlign: "center",
  },
});

export default LandingFinal;
