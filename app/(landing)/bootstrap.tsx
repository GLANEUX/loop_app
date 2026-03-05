import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

import { Palette, Typography } from "@/constants/theme";
import { getAccessToken } from "@/lib/session";
import { getMyProfileCached } from "@/lib/user";

export default function WelcomePage() {
  const insets = useSafeAreaInsets();
  const [statusText, setStatusText] = useState("Préparation de la scène...");

  // Animation du loader (rotation infinie)
  const rotation = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation d'entrée
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Loop du loader
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1200,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      })
    ).start();

    const bootstrapApp = async () => {
      const startTime = Date.now();
      
      try {
        setStatusText("Vérification de l'accordage...");
        const token = await getAccessToken();

        if (!token) {
          // Pas de session -> Landing
          finishBootstrap("/discover-musicians", startTime);
          return;
        }

        setStatusText("Récupération de tes réglages...");
        const me = await getMyProfileCached(token);

        // Logique de redirection selon l'état du profil
        if (!me.profile?.firstName) {
          finishBootstrap("/name", startTime);
        } else if (!me.profile?.instruments?.length) {
          finishBootstrap("/skills", startTime);
        } else {
          // Tout est ok -> Dashboard
          finishBootstrap("/explore", startTime);
        }
      } catch (err) {
        console.error("[Welcome] Bootstrap error:", err);
        // En cas d'erreur, on renvoie vers la landing pour être sûr
        finishBootstrap("/discover-musicians", startTime);
      }
    };

    const finishBootstrap = (route: string, startTime: number) => {
      const elapsed = Date.now() - startTime;
      const minDuration = 2000; // On laisse l'animation au moins 2s pour le look
      const delay = Math.max(0, minDuration - elapsed);

      setTimeout(() => {
        router.replace(route as any);
      }, delay);
    };

    bootstrapApp();
  }, [rotation, fadeAnim]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["rgba(140, 37, 59, 0.8)", Palette.bgBlack]}
        style={StyleSheet.absoluteFill}
      />
      
      <Animated.View 
        style={[
          styles.content, 
          { 
            opacity: fadeAnim,
            paddingTop: insets.top + 120,
            paddingBottom: insets.bottom + 100,
          }
        ]}
      >
        {/* Logo + phrase */}
        <View style={styles.header}>
          <Image
            source={require("@/assets/images/logo/full-white.png")}
            style={styles.logo}
            contentFit="contain"
            transition={300}
          />

          <Text style={styles.title}>
            L'endroit où les{"\n"}musiciens s&apos;accordent
          </Text>
        </View>

        {/* Loader + texte */}
        <View style={styles.footer}>
          <View style={styles.loaderContainer}>
            <Animated.View
              style={[styles.loader, { transform: [{ rotate: spin }] }]}
            />
            <View style={styles.loaderInner} />
          </View>

          <Text style={styles.loadingText}>{statusText}</Text>
        </View>
      </Animated.View>
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
    alignItems: "center",
  },

  /* ---- HEADER ---- */
  header: {
    alignItems: "center",
    gap: 32,
  },
  logo: {
    width: 240,
    height: 100,
  },
  title: {
    ...Typography.title2,
    color: Palette.bgWhite,
    textAlign: "center",
    opacity: 0.9,
    letterSpacing: 0.5,
  },

  /* ---- FOOTER ---- */
  footer: {
    alignItems: "center",
    gap: 20,
  },
  loaderContainer: {
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  loader: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderTopColor: Palette.primary,
    borderRightColor: Palette.primary,
  },
  loaderInner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(221, 96, 49, 0.1)",
  },
  loadingText: {
    ...Typography.bodyRegular,
    color: Palette.bgWhite,
    textAlign: "center",
    fontSize: 14,
    opacity: 0.7,
  },
});
