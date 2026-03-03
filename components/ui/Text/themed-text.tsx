// components/ui/Text/themed-text.tsx
import { Typography } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import React from "react";
import { StyleSheet, Text, type TextProps, type TextStyle } from "react-native";

export type ThemedTextType =
  | "title"
  | "subtitle"
  | "body"
  | "bodyBold"
  | "caption"
  | "label"
  | "small"
  | "default"
  | "defaultSemiBold";

export interface ThemedTextProps extends TextProps {
  lightColor?: string;
  darkColor?: string;
  type?: ThemedTextType;
}

export function ThemedText(props: Readonly<ThemedTextProps>) {
  const { style, lightColor, darkColor, type = "default", ...rest } = props;

  const color = useThemeColor(
    { light: lightColor, dark: darkColor },
    "textPrimary"
  );

  return <Text style={[{ color }, textStyles[type], style]} {...rest} />;
}

const textStyles: Record<ThemedTextType, TextStyle> = StyleSheet.create({
  // gros titres
  title: {
    ...Typography.title1Bold,
  },
  subtitle: {
    ...Typography.title2Bold,
  },

  // corps de texte
  body: {
    ...Typography.bodyRegular,
  },
  bodyBold: {
    ...Typography.bodyBold,
  },

  // petits textes
  caption: {
    ...Typography.smallLight,
  },
  label: {
    ...Typography.smallSemibold,
  },
  small: {
    ...Typography.smallLight,
  },

  // valeurs par défaut
  default: {
    ...Typography.bodyRegular,
  },
  defaultSemiBold: {
    ...Typography.bodyMedium, // on mappe sur bodyMedium
  },
});
