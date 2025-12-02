// app/(tabs)/_layout.tsx
import FriendIconWhite from "@/assets/icons/icons/friends-outline-white.svg";
import FriendIconBlack from "@/assets/icons/icons/friends-outline.svg";
import HomeIconWhite from "@/assets/icons/icons/home-5-outline-white.svg";
import HomeIconBlack from "@/assets/icons/icons/home-5-outline.svg";
import MessageIconWhite from "@/assets/icons/icons/message-outline-white.svg";
import MessageIconBlack from "@/assets/icons/icons/message-outline.svg";
import MusicIconWhite from "@/assets/icons/icons/music-white.svg";
import UserIconWhite from "@/assets/icons/icons/user-outline-white.svg";
import UserIconBlack from "@/assets/icons/icons/user-outline.svg";
import { LoopTabBar } from "@/components/navigation/LoopTabBar";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <LoopTabBar {...props} />}
    >
      <Tabs.Screen
        name="match"
        options={{
          title: "Match",
          tabBarIcon: ({ color, focused }) =>
            focused ? <HomeIconWhite /> : <HomeIconBlack />,
        }}
      />
      <Tabs.Screen
        name="pro"
        options={{
          title: "Pro",
          tabBarIcon: ({ color, focused }) =>
            focused ? <FriendIconWhite /> : <FriendIconBlack />,
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
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color, focused }) =>
            focused ? <MessageIconWhite /> : <MessageIconBlack />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) =>
            focused ? <UserIconWhite /> : <UserIconBlack />,
        }}
      />
    </Tabs>
  );
}
