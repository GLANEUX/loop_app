// components/ui/Button/ButtonLoop.tsx
import ArrowRight from "@/assets/icons/icons/direction-right-2-outline-white.svg";
import { Palette, Typography } from "@/constants/theme";
import React from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

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

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        isPrimary ? styles.primary : styles.outline,
        fullWidth && { alignSelf: "stretch" },
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isPrimary ? Palette.bgWhite : Palette.primary}
        />
      ) : (
        <View style={styles.contentRow}>
          <Text
            style={[
              styles.text,
              isPrimary ? styles.textPrimary : styles.textOutline,
            ]}
          >
            {label}
          </Text>

          {withArrow && <ArrowRight width={30} height={30} />}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: Palette.primary,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: Palette.primary,
    backgroundColor: "transparent",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  text: {
    ...Typography.bodyBold,
    fontSize: 16,
  },
  textPrimary: {
    color: Palette.bgWhite,
  },
  textOutline: {
    color: Palette.primary,
  },
});

export default ButtonLoop;
