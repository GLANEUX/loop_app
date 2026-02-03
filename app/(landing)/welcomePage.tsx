import { useEffect, useRef } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Palette, Typography } from "@/constants/theme";
import { router } from "expo-router";

export default function WelcomePage() {
  const insets = useSafeAreaInsets();

  // Animation du loader (rotation infinie)
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    const timer = setTimeout(() => {
      router.replace("/(landing)/landing-1");
    }, 2000);
    return () => clearTimeout(timer);
  }, [rotation]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 200,
          paddingBottom: insets.bottom + 200,
        },
      ]}
    >
      {/* Logo + phrase */}
      <View style={styles.header}>
        <Image
          source={require("@/assets/images/logo/logo-loop-white.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>
          Rejoins-nous là où les{"\n"}musiciens s&apos;accordent
        </Text>
      </View>

      {/* Loader + texte */}
      <View style={styles.footer}>
        <Animated.View
          style={[styles.loader, { transform: [{ rotate: spin }] }]}
        />

        <Text style={styles.loadingText}>Accordage des cordes...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.bgBlack,
    justifyContent: "space-between",
    alignItems: "center",
  },

  /* ---- HEADER ---- */
  header: {
    alignItems: "center",
    gap: 24,
  },
  logo: {
    width: 220,
    height: 120,
  },
  title: {
    ...Typography.title2, // Poppins 22px
    color: Palette.bgWhite,
    textAlign: "center",
  },

  /* ---- FOOTER ---- */
  footer: {
    alignItems: "center",
    gap: 16,
  },
  loader: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: Palette.grey800, // cercle gris
    borderTopColor: Palette.primary, // arc orange
  },

  loadingText: {
    ...Typography.bodyRegular,
    color: Palette.bgWhite,
    textAlign: "center",
  },
});
