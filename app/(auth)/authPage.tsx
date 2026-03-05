// app/authPage.tsx
import InfoIcon from "@/assets/icons/icons/information-circle-white.svg";
import { ButtonLoop, IconButton } from "@/components/ui";
import { getOnboardingEntry } from "@/lib/onboarding";
import { getAccessToken } from "@/lib/session";
import { getMyProfileCached } from "@/lib/user";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
    router.replace("/login");
  };

  const handleRegister = () => {
    router.replace("/signup");
  };

  const handleInfoPress = () => {
    router.replace("/discover-musicians");
  };

  if (checking) return null;

  return (
    <ImageBackground
      source={require("@/assets/images/auth/auth-landing.png")}
      style={styles.background}
      resizeMode="cover"
    >
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
          <ButtonLoop
            label="Connexion"
            variant="outline"
            onPress={handleLogin}
          />

          <ButtonLoop
            label="S’inscrire gratuitement"
            onPress={handleRegister}
          />

          {/* <SocialAuthSection onSelect={handleSocial} /> */}
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
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
