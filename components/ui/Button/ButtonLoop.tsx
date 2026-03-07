import ArrowRight from "@/assets/icons/icons/direction-right-2-outline-white.svg";
import { Palette, Typography } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  StyleSheet,
  Text,
  Pressable,
  View,
  ViewStyle,
} from "react-native";
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring 
} from "react-native-reanimated";

type ButtonVariant = "primary" | "outline";

interface ButtonLoopProps {
  label: string;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  withArrow?: boolean;
  style?: ViewStyle;
}

export const ButtonLoop: React.FC<ButtonLoopProps> = ({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  fullWidth = true,
  withArrow = false,
  style,
}) => {
  const isPrimary = variant === "primary";
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.96, { damping: 10, stiffness: 300 });
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const content = (
    <View style={styles.contentRow}>
      <Text
        style={[
          styles.text,
          isPrimary ? styles.textPrimary : styles.textOutline,
        ]}
      >
        {label}
      </Text>

      {withArrow && (
        <View style={styles.arrowContainer}>
          <ArrowRight width={24} height={24} />
        </View>
      )}
    </View>
  );

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.pressableBase,
        fullWidth && { alignSelf: "stretch" },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.base,
          isPrimary && styles.shadow,
          disabled && { opacity: 0.5 },
          animatedStyle,
        ]}
      >
        {isPrimary ? (
          <LinearGradient
            colors={[Palette.primary, "#B04226"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          >
            {loading ? (
              <ActivityIndicator size="small" color={Palette.bgWhite} />
            ) : (
              content
            )}
          </LinearGradient>
        ) : (
          <View style={[styles.outline, styles.gradient]}>
            {loading ? (
              <ActivityIndicator size="small" color={Palette.primary} />
            ) : (
              content
            )}
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressableBase: {
    // Necessary to avoid shadow clipping if needed
  },
  base: {
    borderRadius: 100,
    height: 60,
    justifyContent: "center",
    overflow: "hidden",
  },
  gradient: {
    flex: 1,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  outline: {
    borderWidth: 2,
    borderColor: Palette.primary,
    backgroundColor: "transparent",
  },
  shadow: {
    // Ombre pour iOS
    shadowColor: Palette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    // Elévation pour Android
    elevation: 6,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    position: "relative",
  },
  text: {
    ...Typography.bodyBold,
    fontSize: 18,
    letterSpacing: 0.5,
  },
  textPrimary: {
    color: Palette.bgWhite,
  },
  textOutline: {
    color: Palette.primary,
  },
  arrowContainer: {
    position: "absolute",
    right: 0,
  },
});

export default ButtonLoop;
