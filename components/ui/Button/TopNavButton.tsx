// components/ui/Button/TopNavButton.tsx
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
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={0.7} 
      style={style}
      // Agrandit la zone tactile de 20px tout autour du bouton sans changer le visuel
      hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      {variant === "pill" ? (
        <View style={styles.pill}>
          <Text style={styles.pillText}>{label}</Text>
        </View>
      ) : (
        <View style={styles.textContainer}>
          <Text style={styles.textOnly}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  pillText: {
    ...Typography.smallSemibold,
    color: Palette.bgWhite,
  },
  textContainer: {
    padding: 8, // Ajoute une zone de clic interne supplémentaire
  },
  textOnly: {
    ...Typography.smallSemibold,
    color: "rgba(255, 255, 255, 0.8)",
  },
});

export default TopNavButton;
