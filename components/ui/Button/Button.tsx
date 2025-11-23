// components/ui/Button/Button.tsx
import type { ReactNode } from "react";
import type { StyleProp, TextStyle, ViewStyle } from "react-native";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Colors, Typography } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export type ButtonVariant = "primary" | "secondary";
export type ButtonSize = "small" | "medium" | "large";

export interface ButtonProps {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

/**
 * Bouton principal Loop (CTA / pill)
 * - primary : fond orange, texte blanc
 * - secondary : fond transparent, bordure orange, texte orange
 */
export const Button = ({
  label,
  variant = "primary",
  size = "large",
  fullWidth = true,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  onPress,
  style,
  textStyle,
}: ButtonProps) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];

  const sizeStyle = sizeStyles[size];

  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      disabled={disabled || loading}
      style={({ pressed }) => {
        const base: ViewStyle = {
          opacity: disabled ? 0.6 : pressed ? 0.9 : 1,
        };

        const variantStyle =
          variant === "primary"
            ? getPrimaryStyle(theme, disabled, pressed)
            : getSecondaryStyle(theme, disabled, pressed);

        return [
          styles.base,
          sizeStyle,
          fullWidth && styles.fullWidth,
          variantStyle,
          base,
          style,
        ];
      }}
    >
      <View style={styles.content}>
        {leftIcon && <View style={styles.icon}>{leftIcon}</View>}

        {loading ? (
          <ActivityIndicator
            color={variant === "primary" ? theme.ctaText : theme.brandPrimary}
          />
        ) : (
          <Text
            style={[
              Typography.bodyBold,
              variant === "primary"
                ? { color: theme.ctaText }
                : { color: theme.brandPrimary },
              textStyle,
            ]}
          >
            {label}
          </Text>
        )}

        {rightIcon && !loading && <View style={styles.icon}>{rightIcon}</View>}
      </View>
    </Pressable>
  );
};

function getPrimaryStyle(
  theme: (typeof Colors)["light"],
  disabled: boolean,
  pressed: boolean
) {
  let backgroundColor = theme.ctaBg;

  if (pressed && !disabled) {
    backgroundColor = theme.ctaBgPressed;
  }
  if (disabled) {
    backgroundColor = theme.ctaBgDisabled;
  }

  return {
    backgroundColor,
    borderRadius: 999,
  } as ViewStyle;
}

function getSecondaryStyle(
  theme: (typeof Colors)["light"],
  disabled: boolean,
  pressed: boolean
) {
  let borderColor = theme.brandPrimary;
  let backgroundColor: string | undefined;

  if (pressed && !disabled) {
    backgroundColor = theme.brandPrimary;
  }
  if (disabled) {
    borderColor = theme.border;
    backgroundColor = theme.backgroundAlt;
  }

  return {
    backgroundColor: backgroundColor ?? "transparent",
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor,
  } as ViewStyle;
}

const styles = StyleSheet.create({
  base: {
    justifyContent: "center",
    alignItems: "center",
  },
  fullWidth: {
    alignSelf: "stretch",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  icon: {
    justifyContent: "center",
    alignItems: "center",
  },
});

const sizeStyles: Record<ButtonSize, ViewStyle> = {
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  medium: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  large: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
};
