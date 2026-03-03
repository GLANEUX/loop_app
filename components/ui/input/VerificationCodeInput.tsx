import { Palette, Typography } from "@/constants/theme";
import React, { useRef, useState } from "react";
import {
  TextInput as RNTextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface VerificationCodeInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
  autoFocus?: boolean;
  containerStyle?: ViewStyle;
}

export const VerificationCodeInput: React.FC<VerificationCodeInputProps> = ({
  length = 4,
  value,
  onChange,
  hasError = false,
  autoFocus = true,
  containerStyle,
}) => {
  const inputRef = useRef<RNTextInput | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleChangeText = (text: string) => {
    const cleaned = text.replace(/\D/g, "").slice(0, length);
    onChange(cleaned);
  };

  const handlePressBoxes = () => {
    // Si RN pense qu'il est déjà focus, on force un blur puis un focus
    if (isFocused) {
      inputRef.current?.blur();
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    } else {
      inputRef.current?.focus();
    }
  };

  const digits = value.padEnd(length, " ").split("");

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {/* INPUT INVISIBLE QUI PREND LA ZONE */}
      <RNTextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChangeText}
        keyboardType="number-pad"
        maxLength={length}
        style={styles.hiddenInput}
        autoFocus={autoFocus}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      {/* VISUEL DES CASES */}
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.codeBoxesWrapper}
        onPress={handlePressBoxes}
      >
        {digits.map((digit, index) => {
          const hasDigit = digit.trim().length > 0;

          return (
            <View
              key={index}
              style={[
                styles.codeBox,
                hasError && styles.codeBoxError,
                !hasError && hasDigit && styles.codeBoxFilled,
              ]}
            >
              <Text style={styles.codeDigit}>{hasDigit ? digit : " "}</Text>
            </View>
          );
        })}
      </TouchableOpacity>
    </View>
  );
};

const BOX_SIZE = 70;

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 12,
  },
  hiddenInput: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0, // totalement invisible mais occupe la zone
  },
  codeBoxesWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  codeBox: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Palette.bgWhite,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  codeBoxFilled: {
    borderColor: Palette.primary,
  },
  codeBoxError: {
    borderColor: Palette.primary,
    backgroundColor: "rgba(239,68,68,0.12)",
  },
  codeDigit: {
    ...Typography.title2Bold,
    color: Palette.bgWhite,
  },
});

export default VerificationCodeInput;
