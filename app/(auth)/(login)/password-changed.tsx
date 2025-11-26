// app/(auth)/(login)/password-changed.tsx
import StarIcon from "@/assets/icons/icons/shine-star.svg";
import { ButtonLoop } from "@/components/ui";
import { Palette, Typography } from "@/constants/theme";
import { useRouter } from "expo-router";
import React from "react";
import { ImageBackground, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const PasswordChangedScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleGoToLogin = () => {
    router.replace("/(auth)/(login)/login");
  };

  return (
    <ImageBackground
      source={require("@/assets/images/auth/login-landing.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <View
        style={[
          styles.safeArea,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <View style={styles.centerContainer}>
          <View style={styles.starWrapper}>
            <StarIcon width={70} height={70} style={styles.star1} />
            <StarIcon width={50} height={50} style={styles.star2} />
          </View>

          <Text style={styles.title}>Mot de passe modifié</Text>

          <View style={{ marginTop: 32, width: "100%" }}>
            <ButtonLoop label="Me connecter" onPress={handleGoToLogin} />
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    ...Typography.title1Bold,
    color: Palette.bgWhite,
    textAlign: "center",
  },
  starWrapper: {
    position: "relative",
    width: 90,
    height: 90,
    marginBottom: 20,
  },
  star1: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  star2: {
    position: "absolute",
    bottom: -10,
    right: -10,
  },
});

export default PasswordChangedScreen;
