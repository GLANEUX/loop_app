// src/screens/onboarding/WelcomeRulesScreen.tsx
import { ButtonLoop } from "@/components/ui";
import { Palette, Typography } from "@/constants/theme";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const WelcomeRulesScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleStart = () => {
    router.replace("/(app)/home"); // ou ton premier écran in-app
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Bienvenue sur Loop</Text>

        <Text style={styles.intro}>
          Ici, la musique se rencontre, se crée et se partage. Avant de te
          lancer, voici les bases :
        </Text>

        <View style={styles.ruleBlock}>
          <Text style={styles.ruleTitle}>✓ 🎯 Sois authentique</Text>
          <Text style={styles.ruleText}>
            Montre ton univers, ton vibe, ton énergie. Les meilleures connexions
            naissent quand tu es toi-même.
          </Text>
        </View>

        <View style={styles.ruleBlock}>
          <Text style={styles.ruleTitle}>✓ 🎧 Collabore dans le respect</Text>
          <Text style={styles.ruleText}>
            Chaque artiste a sa propre vibe. Reste ouvert, à l’écoute, et crée
            dans le respect — c’est ça, la magie de Loop.
          </Text>
        </View>

        <View style={styles.ruleBlock}>
          <Text style={styles.ruleTitle}>✓ 🚀 Crée, évolue, brille</Text>
          <Text style={styles.ruleText}>
            Jam, mix, crée — à ta façon. Plus tu vibres avec Loop, plus ton flow
            évolue. Et ta musique avec.
          </Text>
        </View>
      </View>

      <View style={styles.buttonWrapper}>
        <ButtonLoop label="Commencer" onPress={handleStart} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.bgBlack,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
  },
  title: {
    ...Typography.title1Bold,
    color: Palette.bgWhite,
    textAlign: "center",
    marginBottom: 16,
  },
  intro: {
    ...Typography.bodyRegular,
    color: Palette.bgWhite,
    textAlign: "center",
    marginBottom: 24,
  },
  ruleBlock: {
    marginBottom: 20,
  },
  ruleTitle: {
    ...Typography.title3Bold,
    color: Palette.bgWhite,
    marginBottom: 6,
  },
  ruleText: {
    ...Typography.bodyRegular,
    color: Palette.bgWhite,
  },
  buttonWrapper: {
    marginTop: 16,
  },
});

export default WelcomeRulesScreen;
