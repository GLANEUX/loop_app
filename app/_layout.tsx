// app/_layout.tsx
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Palette } from "@/constants/theme";
import { Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "@/lib/auth-context";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const pathname = usePathname();
  const [fontsLoaded] = useFonts({
    Poppins_Regular: require("@/assets/fonts/Poppins-Regular.ttf"),
    Poppins_Medium: require("@/assets/fonts/Poppins-Medium.ttf"),
    Poppins_SemiBold: require("@/assets/fonts/Poppins-SemiBold.ttf"),
    Poppins_Bold: require("@/assets/fonts/Poppins-Bold.ttf"),
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
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Palette.bgBlack }}>
      <AuthProvider>
        <ThemeProvider
          value={{
            ...DefaultTheme,
            colors: {
              ...DefaultTheme.colors,
              background: Palette.bgBlack,
            },
          }}
        >
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "ios_from_right",
              contentStyle: { backgroundColor: Palette.bgBlack },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(landing)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(settings)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
          <StatusBar style="light" />
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
