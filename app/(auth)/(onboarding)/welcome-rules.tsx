// src/screens/onboarding/WelcomeRulesScreen.tsx
import { ButtonLoop } from "@/components/ui";
import { Palette, Typography } from "@/constants/theme";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View, Image, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

export const WelcomeRulesScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleStart = () => {
    router.replace("/explore");
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["rgba(140, 37, 59, 0.4)", Palette.bgBlack]}
        style={StyleSheet.absoluteFill}
      />
      
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image
            source={require("@/assets/images/logo/full-white.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Bienvenue sur Loop</Text>
          <Text style={styles.intro}>
            Ici, la musique se rencontre, se crée et se partage. Avant de te
            lancer, voici les bases :
          </Text>
        </View>

        <View style={styles.rulesContainer}>
          <View style={styles.ruleCard}>
            <View style={styles.ruleIconContainer}>
              <Text style={styles.ruleEmoji}>🎯</Text>
            </View>
            <View style={styles.ruleTextContent}>
              <Text style={styles.ruleTitle}>Sois authentique</Text>
              <Text style={styles.ruleText}>
                Montre ton univers et ton énergie. Les meilleures connexions
                naissent quand tu es toi-même.
              </Text>
            </View>
          </View>

          <View style={styles.ruleCard}>
            <View style={styles.ruleIconContainer}>
              <Text style={styles.ruleEmoji}>🎧</Text>
            </View>
            <View style={styles.ruleTextContent}>
              <Text style={styles.ruleTitle}>Collabore dans le respect</Text>
              <Text style={styles.ruleText}>
                Chaque artiste a sa propre vibe. Reste ouvert, à l’écoute, et crée
                dans le respect.
              </Text>
            </View>
          </View>

          <View style={styles.ruleCard}>
            <View style={styles.ruleIconContainer}>
              <Text style={styles.ruleEmoji}>🚀</Text>
            </View>
            <View style={styles.ruleTextContent}>
              <Text style={styles.ruleTitle}>Crée, évolue, brille</Text>
              <Text style={styles.ruleText}>
                Jam, mix, crée — à ta façon. Plus tu vibres avec Loop, plus ton flow
                évolue.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonWrapper}>
          <ButtonLoop label="C'est parti !" onPress={handleStart} withArrow />
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 50,
    marginBottom: 20,
  },
  title: {
    ...Typography.title1Bold,
    color: Palette.bgWhite,
    textAlign: "center",
    marginBottom: 12,
    fontSize: 32,
  },
  intro: {
    ...Typography.bodyRegular,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
  },
  rulesContainer: {
    gap: 16,
    marginVertical: 30,
  },
  ruleCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
  },
  ruleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(221, 96, 49, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  ruleEmoji: {
    fontSize: 24,
  },
  ruleTextContent: {
    flex: 1,
  },
  ruleTitle: {
    ...Typography.bodyBold,
    color: Palette.bgWhite,
    marginBottom: 4,
    fontSize: 17,
  },
  ruleText: {
    ...Typography.smallRegular,
    color: "rgba(255, 255, 255, 0.6)",
    lineHeight: 20,
  },
  buttonWrapper: {
    marginTop: "auto",
  },
});

export default WelcomeRulesScreen;
