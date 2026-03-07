import { getOnboardingEntry } from "@/lib/onboarding";
import { getAccessToken } from "@/lib/session";
import { getMyProfileCached } from "@/lib/user";
import { Palette } from "@/constants/theme";
import { Stack, usePathname, useRouter, useSegments } from "expo-router";
import React, { useEffect, useState } from "react";
import { View } from "react-native";

export default function LandingLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    const checkSession = async () => {
      if (
        pathname?.includes("/(onboarding)") ||
        segments.includes("(onboarding)")
      ) {
        if (active) setChecking(false);
        return;
      }
      try {
        const token = await getAccessToken();
        if (!token) {
          if (active) setChecking(false);
          return;
        }
        const me = await getMyProfileCached(token);
        const entry = getOnboardingEntry(me.profile);
        if (active) {
          // router.replace(entry ?? "/explore");
        }
        setChecking(false);
      } catch {
        if (active) setChecking(false);
      }
    };
    checkSession();
    return () => {
      active = false;
    };
  }, [router, pathname, segments]);

  return (
    <View style={{ flex: 1, backgroundColor: Palette.bgBlack }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: Palette.bgBlack },
        }}
      />
    </View>
  );
}
