// src/components/onboarding/OnboardingLayout.tsx
import BackIcon from "@/assets/icons/icons/direction-right-2-outline-white.svg";
import { getPreviousOnboardingRoute } from "@/lib/onboarding";
import { useNavigation } from "@react-navigation/native";
import { usePathname, useRouter } from "expo-router";
import React, { ReactNode } from "react";
import {
  ImageBackground,
  ImageSourcePropType,
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
  const keyboardOffset = Platform.OS === "ios" ? insets.top + 12 : 0;
  const scrollBottomPadding = insets.bottom + 120;

  return (
    <ImageBackground
      source={imageSource}
      style={styles.background}
      resizeMode="cover"
    >
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
              paddingBottom: insets.bottom + 8,
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
  content: {
    paddingTop: 8,
    paddingBottom: 60,
  },
});

export default OnboardingLayout;
