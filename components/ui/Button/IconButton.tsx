// components/ui/Button/IconButton.tsx
import { Palette } from "@/constants/theme";
import React from "react";
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import type { SvgProps } from "react-native-svg";

type IconComponent = React.FC<SvgProps>;

interface IconButtonProps {
  icon: IconComponent;
  onPress: () => void;
  size?: number;
  style?: ViewStyle;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  onPress,
  size = 38,
  style,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.wrapper,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    >
      <Icon width={18} height={18} color={Palette.bgWhite} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Palette.opacityBackground,
    borderWidth: 1,
    borderColor: Palette.grey200,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default IconButton;
