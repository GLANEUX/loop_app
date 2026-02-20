// app/(tabs)/_layout.tsx
import MessageIconWhite from "@/assets/icons/icons/message-outline-white.svg";
import MessageIconBlack from "@/assets/icons/icons/message-outline.svg";
import MusicIconWhite from "@/assets/icons/icons/music-white.svg";
import UserIconWhite from "@/assets/icons/icons/user-outline-white.svg";
import UserIconBlack from "@/assets/icons/icons/user-outline.svg";
import { LoopTabBar } from "@/components/navigation/LoopTabBar";
import { Palette } from "@/constants/theme";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: Palette.bgBlack },
      }}
      tabBar={(props) => <LoopTabBar {...props} />}
    >
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color, focused }) =>
            focused ? <MessageIconWhite /> : <MessageIconBlack />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explorer",
          tabBarIcon: ({ color, focused }) => <MusicIconWhite />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, focused }) =>
            focused ? <UserIconWhite /> : <UserIconBlack />,
        }}
      />
    </Tabs>
  );
}
