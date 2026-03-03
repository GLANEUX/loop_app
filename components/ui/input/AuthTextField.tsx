// src/components/ui/input/AuthTextField.tsx
import { Palette, Typography } from "@/constants/theme";
import React from "react";
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import type { SvgProps } from "react-native-svg";

type IconComponent = React.FC<SvgProps>;

interface AuthTextFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps["autoCapitalize"];
  secureTextEntry?: boolean;
  onToggleSecure?: () => void;
  error?: string | null;
  showErrorText?: boolean;
  containerStyle?: ViewStyle;
  LeftIcon?: IconComponent;
  RightIcon?: IconComponent;
}

export const AuthTextField: React.FC<AuthTextFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "none",
  secureTextEntry,
  onToggleSecure,
  error,
  showErrorText = true,
  containerStyle,
  LeftIcon,
  RightIcon,
}) => {
  const hasError = Boolean(error);

  return (
    <View style={[styles.fieldBlock, containerStyle]}>
      <Text style={[styles.label, hasError && { color: Palette.primary }]}>
        {label}
      </Text>

      <View
        style={[
          styles.inputContainer,
          hasError ? styles.inputErrorBorder : styles.inputBorder,
        ]}
      >
        {LeftIcon && (
          <LeftIcon width={18} height={18} color={Palette.bgWhite} />
        )}

        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Palette.grey300}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry}
        />

        {RightIcon && (
          <TouchableOpacity onPress={onToggleSecure} disabled={!onToggleSecure}>
            <RightIcon width={18} height={18} color={Palette.bgWhite} />
          </TouchableOpacity>
        )}
      </View>

      {hasError && showErrorText && (
        <Text style={styles.fieldError}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fieldBlock: {
    marginBottom: 10,
  },
  label: {
    ...Typography.bodyMedium,
    color: Palette.bgWhite,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 16,
    height: 54,
    gap: 8,
  },
  input: {
    flex: 1,
    color: Palette.bgWhite,
    ...Typography.bodyRegular,
    fontSize: 15,
    paddingVertical: 0,
    height: "100%",
  },
  inputBorder: {
    borderWidth: 1.5,
    borderColor: Palette.bgWhite,
  },
  inputErrorBorder: {
    borderWidth: 1.5,
    borderColor: Palette.primary,
  },
  fieldError: {
    marginTop: 4,
    ...Typography.smallLight,
    color: Palette.primary,
  },
});

export default AuthTextField;
