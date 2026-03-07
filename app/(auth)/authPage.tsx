// app/(auth)/authPage.tsx
import InfoIcon from "@/assets/icons/icons/information-circle-white.svg";
import { ButtonLoop, IconButton } from "@/components/ui";
import { Palette, Typography } from "@/constants/theme";
import { getOnboardingEntry } from "@/lib/onboarding";
import { getAccessToken } from "@/lib/session";
import { getMyProfileCached } from "@/lib/user";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, StatusBar } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { 
  FadeInDown, 
  FadeIn, 
} from "react-native-reanimated";

export const AuthLandingScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    const checkSession = async () => {
      try {
        const token = await getAccessToken();
        if (!token) {
          if (active) setChecking(false);
          return;
        }
        const me = await getMyProfileCached(token);
        const entry = getOnboardingEntry(me.profile);
        if (active) {
          router.replace(entry ?? "/explore");
        }
      } catch {
        if (active) setChecking(false);
      }
    };
    checkSession();
    return () => {
      active = false;
    };
  }, [router]);

  const handleLogin = () => {
    router.push("/login");
  };

  const handleRegister = () => {
    router.push("/signup");
  };

  const handleInfoPress = () => {
    router.replace("/discover-musicians");
  };

  if (checking) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background with Expo Image for optimized loading */}
      <View style={StyleSheet.absoluteFill}>
        <Image
          source={require("@/assets/images/auth/auth-landing.png")}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={600}
          priority="high"
          placeholder="L025_#00000000"
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.6)", Palette.bgBlack]}
          locations={[0, 0.4, 0.8]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View
        style={[
          styles.safeAreaContainer,
          {
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 24,
          },
        ]}
      >
        <View style={styles.topBar}>
          <IconButton icon={InfoIcon} onPress={handleInfoPress} size={38} />
        </View>

        <View style={styles.bottomCard}>
          <Animated.View entering={FadeInDown.delay(400).duration(800).springify()}>
            <ButtonLoop
              label="Connexion"
              variant="outline"
              onPress={handleLogin}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(600).duration(800).springify()}>
            <ButtonLoop
              label="S’inscrire gratuitement"
              onPress={handleRegister}
            />
          </Animated.View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.bgBlack,
  },
  safeAreaContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  topBar: {
    width: "100%",
    alignItems: "flex-end",
  },
  bottomCard: {
    gap: 16,
    marginBottom: 20,
  },
});

export default AuthLandingScreen;
