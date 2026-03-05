// src/components/onboarding/OnboardingLayout.tsx
import BackIcon from "@/assets/icons/icons/direction-right-2-outline-white.svg";
import { getPreviousOnboardingRoute } from "@/lib/onboarding";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { usePathname, useRouter } from "expo-router";
import React, { ReactNode, useEffect, useState } from "react";
import {
  ImageBackground,
  ImageSourcePropType,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OnboardingProgressBar } from "./OnboardingProgressBar";

interface OnboardingLayoutProps {
  imageSource: ImageSourcePropType;
  progress: number; // 0 -> 1
  onBack?: () => void;
  disableBack?: boolean;
  children: ReactNode;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  imageSource,
  progress,
  onBack,
  disableBack = false,
  children,
}) => {
  const router = useRouter();
  const navigation = useNavigation();
  const pathname = usePathname();
  const previousRoute = getPreviousOnboardingRoute(pathname);
  const canGoBack =
    typeof navigation?.canGoBack === "function" ? navigation.canGoBack() : false;
  const handleBack = disableBack
    ? undefined
    : onBack
      ? onBack
      : canGoBack
        ? () => router.back()
        : previousRoute
          ? () => router.replace(previousRoute)
          : undefined;
  const insets = useSafeAreaInsets();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const keyboardOffset = Platform.OS === "ios" ? insets.top + 12 : 0;
  const scrollBottomPadding = isKeyboardVisible ? 24 : insets.bottom + 120;

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setIsKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <ImageBackground
      source={imageSource}
      style={styles.background}
      resizeMode="cover"
    >
      <LinearGradient
        colors={["rgba(140, 37, 59, 0.7)", "rgba(221, 96, 49, 0.9)"]}
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={keyboardOffset}
      >
        <View
          style={[
            styles.safeArea,
            {
              paddingTop: insets.top + 25,
              paddingBottom: isKeyboardVisible ? 0 : insets.bottom + 8,
            },
          ]}
        >
          {/* Header : back + progress bar */}
          <View style={styles.headerRow}>
            {handleBack && (
              <TouchableOpacity
                onPress={handleBack}
                disabled={!handleBack}
                style={styles.backButton}
                activeOpacity={0.8}
              >
                <BackIcon
                  width={22}
                  height={22}
                  style={{ transform: [{ scaleX: -1 }] }}
                />
              </TouchableOpacity>
            )}

            <View style={styles.progressContainer}>
              <OnboardingProgressBar progress={progress} />
            </View>
          </View>

          {/* Contenu qui scrolle au besoin */}
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[
              styles.content,
              { paddingBottom: scrollBottomPadding },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.logoContainer}>
              <Image
                source={require("@/assets/images/logo/full-white.png")}
                style={styles.logo}
                contentFit="contain"
              />
            </View>
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: "black",
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
    marginRight: 12,
  },
  progressContainer: {
    flex: 1,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 10,
  },
  logo: {
    width: 140,
    height: 60,
  },
  content: {
    paddingTop: 8,
    paddingBottom: 60,
  },
});

export default OnboardingLayout;
