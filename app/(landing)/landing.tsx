import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Palette } from "@/constants/theme";

export default function LandingPage() {
  const insets = useSafeAreaInsets();

  const logoAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(logoAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();

    // const timer = setTimeout(() => {
    //   router.replace("/(landing)/landing-1");
    // }, 2000);
    // return () => clearTimeout(timer);
  }, [logoAnim]);

  const scale = logoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  return (
    <LinearGradient
      colors={[Palette.secondary50, Palette.primary]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <Animated.Image
        source={require("@/assets/images/logo/logo-loop-white.png")}
        style={[
          styles.logo,
          {
            opacity: logoAnim,
            transform: [{ scale }],
          },
        ]}
        resizeMode="contain"
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 180,
    height: 180,
  },
});
