import { Palette } from "@/constants/theme";
import { Stack } from "expo-router";

export default function MessageLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "ios_from_right",
        contentStyle: { backgroundColor: Palette.bgBlack },
      }}
    />
  );
}
