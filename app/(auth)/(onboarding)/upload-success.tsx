// src/screens/onboarding/UploadSuccessScreen.tsx
import { OnboardingLayout } from "@/components/layout";
import { ButtonLoop } from "@/components/ui";
import { Palette, Typography } from "@/constants/theme";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export const UploadSuccessScreen: React.FC = () => {
  const router = useRouter();

  const handleContinue = () => {
    router.replace("/welcome-rules");
  };

  return (
    <OnboardingLayout
      imageSource={require("@/assets/images/auth/background-3.png")}
      progress={1}
    >
      <Text style={styles.title}>
        Tu pourras en ajouter d’autres directement sur ton profil
      </Text>
      <Text style={styles.subtitle}>On a hâte de découvrir ton univers.</Text>

      <View style={styles.discWrapper}>
        <View style={styles.discOuter}>
          <View style={styles.discInner} />
        </View>
      </View>

      <Text style={styles.helper}>Fichier validé 🎷</Text>

      <View style={styles.buttonWrapper}>
        <ButtonLoop label="Continuer" onPress={handleContinue} />
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  title: {
    ...Typography.title1Bold,
    color: Palette.bgWhite,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.bodyRegular,
    color: Palette.bgWhite,
    textAlign: "center",
    marginBottom: 24,
  },
  discWrapper: {
    alignItems: "center",
    marginBottom: 12,
    marginTop: 8,
  },
  discOuter: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 6,
    borderColor: Palette.bgWhite,
    justifyContent: "center",
    alignItems: "center",
  },
  discInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
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

export default UploadSuccessScreen;
