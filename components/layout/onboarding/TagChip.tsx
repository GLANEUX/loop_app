// src/components/onboarding/TagChip.tsx
import { Palette, Typography } from "@/constants/theme";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface TagChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export const TagChip: React.FC<TagChipProps> = ({
  label,
  selected = false,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Palette.bgWhite,
    marginRight: 10,
    marginBottom: 10,
  },
  chipSelected: {
    backgroundColor: Palette.bgWhite,
  },
  text: {
    ...Typography.bodyBold,
    color: Palette.bgWhite,
  },
  textSelected: {
    color: Palette.black, // adapte selon ta palette
  },
});

export default TagChip;
