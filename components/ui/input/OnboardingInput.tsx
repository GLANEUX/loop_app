import { Palette, Typography } from "@/constants/theme";
import React from "react";
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  Text,
} from "react-native";

interface OnboardingInputProps extends TextInputProps {
  error?: string | null;
}

export const OnboardingInput: React.FC<OnboardingInputProps> = ({
  error,
  style,
  ...props
}) => {
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputWrapper,
          error ? styles.inputError : styles.inputNormal,
        ]}
      >
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    width: "100%",
  },
  inputWrapper: {
    height: 60,
    borderRadius: 16,
    paddingHorizontal: 20,
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1.5,
  },
  inputNormal: {
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  inputError: {
    borderColor: Palette.primary,
  },
  input: {
    ...Typography.bodyBold,
    color: Palette.bgWhite,
    fontSize: 18,
  },
  errorText: {
    marginTop: 6,
    marginLeft: 4,
    ...Typography.smallLight,
    color: Palette.primary,
  },
});
