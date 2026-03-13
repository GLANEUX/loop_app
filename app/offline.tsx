import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Palette, Typography } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";

export default function OfflineScreen() {
  const handleRetry = () => {
    // On renvoie vers le bootstrap pour retenter la connexion
    router.replace("/bootstrap");
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Palette.primary, Palette.bgBlack]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.8 }}
      />
      
      <SafeAreaView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.emoji}>🎸</Text>
          <Text style={styles.title}>Oups, l&apos;ampli est débranché !</Text>
          <Text style={styles.subtitle}>
            Impossible de joindre nos serveurs. Vérifie ta connexion internet ou réessaie dans quelques instants.
          </Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.button} onPress={handleRetry}>
            <Text style={styles.buttonText}>Réessayer la connexion</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.bgBlack,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 30,
    paddingVertical: 60,
  },
  header: {
    alignItems: "center",
    marginTop: 40,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    ...Typography.title1Bold,
    color: Palette.bgWhite,
    textAlign: "center",
    fontSize: 28,
  },
  subtitle: {
    ...Typography.bodyRegular,
    color: Palette.grey300,
    textAlign: "center",
    marginTop: 20,
    lineHeight: 24,
  },
  footer: {
    gap: 16,
  },
  button: {
    backgroundColor: Palette.bgWhite,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  buttonText: {
    ...Typography.bodyBold,
    color: Palette.bgBlack,
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryText: {
    ...Typography.smallLight,
    color: Palette.grey300,
    textDecorationLine: "underline",
  },
});
