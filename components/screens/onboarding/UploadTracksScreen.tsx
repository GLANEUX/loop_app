// src/screens/onboarding/UploadTracksScreen.tsx
import { OnboardingLayout } from "@/components/layout";
import { ButtonLoop } from "@/components/ui";
import { Palette, Typography } from "@/constants/theme";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export const UploadTracksScreen: React.FC = () => {
  const router = useRouter();

  const handleUpload = () => {
    // TODO: ouvrir ton picker de fichiers / sons
    router.push("/(onboarding)/upload-success");
  };

  return (
    <OnboardingLayout
      imageSource={require("@/assets/images/auth/background-3.png")}
      progress={0.9}
      onBack={() => router.back()}
    >
      <Text style={styles.title}>
        Ajoute un ou plusieurs extraits de tes compositions
      </Text>
      <Text style={styles.subtitle}>Fais-nous découvrir ton univers.</Text>

      {/* Gros cercle "vinyle" simplifié */}
      <View style={styles.discWrapper}>
        <View style={styles.discOuter}>
          <View style={styles.discInner} />
        </View>
      </View>

      <Text style={styles.helper}>Fichiers en mp3, mp4, mov ou wav</Text>

      <View style={styles.buttonWrapper}>
        <ButtonLoop
          label="Ajoute ton son pour collaborer"
          onPress={handleUpload}
        />
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  title: {
    ...Typography.title1Bold,
    color: Palette.bgWhite,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.bodyRegular,
    color: Palette.bgWhite,
    marginBottom: 32,
  },
  discWrapper: {
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  discOuter: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 7,
    borderColor: Palette.bgWhite,
    justifyContent: "center",
    alignItems: "center",
  },
  discInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 7,
    borderColor: Palette.bgWhite,
  },
  helper: {
    ...Typography.bodyRegular,
    color: Palette.bgWhite,
    textAlign: "center",
    marginBottom: 24,
  },
  buttonWrapper: {
    marginTop: 8,
  },
});

export default UploadTracksScreen;
