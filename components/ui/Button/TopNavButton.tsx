// src/components/ui/TopNavButton.tsx
import { Palette, Typography } from "@/constants/theme";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface TopNavButtonProps {
  label: string;
  onPress: () => void;
  variant?: "pill" | "text";
  style?: ViewStyle;
}

export const TopNavButton: React.FC<TopNavButtonProps> = ({
  label,
  onPress,
  variant = "pill",
  style,
}) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={style}>
      {variant === "pill" ? (
        <View style={styles.pill}>
          <Text style={styles.pillText}>{label}</Text>
        </View>
      ) : (
        <Text style={styles.textOnly}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Palette.grey800,
    borderWidth: 1,
    borderColor: Palette.grey300,
    alignItems: "center",
    justifyContent: "center",
  },
  pillText: {
    ...Typography.smallSemibold,
    color: Palette.bgWhite,
  },
  textOnly: {
    ...Typography.smallSemibold,
    color: Palette.bgWhite,
  },
});

export default TopNavButton;
