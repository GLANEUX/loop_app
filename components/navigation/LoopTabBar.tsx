// components/navigation/LoopTabBar.tsx
import { Palette } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface LoopTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export const LoopTabBar = ({
  state,
  descriptors,
  navigation,
}: LoopTabBarProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Bandeau crème arrondi bien en bas */}
      <View style={[styles.tabBar, { marginBottom: insets.bottom + 8 }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          // Bouton central = "explore"
          const isMiddle = route.name === "explore";

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          const IconComponent = options.tabBarIcon;

          if (isMiddle) {
            return <View key={route.key} style={{ flex: 1 }} />;
          }

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tab}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconContainer,
                  isFocused && styles.iconContainerFocused,
                ]}
              >
                {IconComponent?.({
                  focused: isFocused,
                  size: 24,
                })}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Middle button */}
      <View
        style={[
          styles.middleButtonContainer,
          { bottom: insets.bottom + 8 + 26 },
        ]}
      >
        {state.routes.map((route, index) => {
          if (route.name !== "explore") return null;

          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const IconComponent = options.tabBarIcon;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.middleButton}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={
                  isFocused
                    ? [Palette.secondary200, Palette.primary]
                    : [Palette.primary, Palette.secondary50]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.middleButtonInner}
              >
                {IconComponent?.({
                  focused: isFocused,
                  size: 32,
                })}
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    pointerEvents: "box-none",
  },
  tabBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: Palette.bgWhite,
    width: "70%",
    alignSelf: "center",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  iconContainerFocused: {
    backgroundColor: Palette.primary,
    borderRadius: 50,
  },
  middleButtonContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  middleButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 10,
  },

  middleButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 99,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default LoopTabBar;
