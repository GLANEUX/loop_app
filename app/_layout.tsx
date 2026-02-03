// app/_layout.tsx
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const pathname = usePathname();
  const [fontsLoaded] = useFonts({
    Poppins_Black: require("@/assets/fonts/Poppins-Black.ttf"),
    Poppins_BlackItalic: require("@/assets/fonts/Poppins-BlackItalic.ttf"),

    Poppins_Bold: require("@/assets/fonts/Poppins-Bold.ttf"),
    Poppins_BoldItalic: require("@/assets/fonts/Poppins-BoldItalic.ttf"),

    Poppins_ExtraBold: require("@/assets/fonts/Poppins-ExtraBold.ttf"),
    Poppins_ExtraBoldItalic: require("@/assets/fonts/Poppins-ExtraBoldItalic.ttf"),

    Poppins_ExtraLight: require("@/assets/fonts/Poppins-ExtraLight.ttf"),
    Poppins_ExtraLightItalic: require("@/assets/fonts/Poppins-ExtraLightItalic.ttf"),

    Poppins_Italic: require("@/assets/fonts/Poppins-Italic.ttf"),

    Poppins_Light: require("@/assets/fonts/Poppins-Light.ttf"),
    Poppins_LightItalic: require("@/assets/fonts/Poppins-LightItalic.ttf"),

    Poppins_Medium: require("@/assets/fonts/Poppins-Medium.ttf"),
    Poppins_MediumItalic: require("@/assets/fonts/Poppins-MediumItalic.ttf"),

    Poppins_Regular: require("@/assets/fonts/Poppins-Regular.ttf"),

    Poppins_SemiBold: require("@/assets/fonts/Poppins-SemiBold.ttf"),
    Poppins_SemiBoldItalic: require("@/assets/fonts/Poppins-SemiBoldItalic.ttf"),

    Poppins_Thin: require("@/assets/fonts/Poppins-Thin.ttf"),
    Poppins_ThinItalic: require("@/assets/fonts/Poppins-ThinItalic.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {
        console.warn("Failed to hide splash screen");
      });
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (pathname) {
      console.log("[nav] current route", pathname);
    }
  }, [pathname]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(landing)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(settings)" />
          <Stack.Screen name="(tabs)" />
          {/*<Stack.Screen name="(messages)" />
        <Stack.Screen name="(match)" />
        <Stack.Screen name="(pro)" />*/}
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
