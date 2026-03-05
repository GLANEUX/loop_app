import { OnboardingLayout } from "@/components/layout";
import { ButtonLoop } from "@/components/ui";
import { Palette, Typography } from "@/constants/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export const OopsScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ next?: string }>();
  const step = typeof params.next === "string" ? params.next : "name";
  const nextRoute = `/${step}`;

  const handleContinue = () => {
    router.push(nextRoute);
  };

  return (
    <OnboardingLayout
      imageSource={require("@/assets/images/auth/background-2.png")}
      progress={0}
      disableBack
    >
      <Text style={styles.title}>Oups...</Text>
      <Text style={styles.subtitle}>
        Tu n’as pas encore complété toutes les informations obligatoires.
      </Text>
      <View style={styles.card}>
        <Text style={styles.cardText}>
          Termine ton onboarding pour accéder à l’app.
        </Text>
      </View>
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
    marginBottom: 10,
  },
  subtitle: {
    ...Typography.bodyRegular,
    color: Palette.bgWhite,
    marginBottom: 24,
  },
  card: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.35)",
    marginBottom: 24,
  },
  cardText: {
    ...Typography.bodyRegular,
    color: Palette.bgWhite,
  },
  buttonWrapper: {
    marginTop: 8,
  },
});

export default OopsScreen;
