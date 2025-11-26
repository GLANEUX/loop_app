// src/components/onboarding/CodeInput.tsx
import { Palette, Typography } from "@/constants/theme";
import React, { useEffect, useRef, useState } from "react";
import {
  TextInput as RNTextInput,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface CodeInputProps {
  length?: number;
  value?: string;
  onChange?: (code: string) => void;
}

export const CodeInput: React.FC<CodeInputProps> = ({
  length = 5,
  value,
  onChange,
}) => {
  const [internal, setInternal] = useState("");
  const inputRef = useRef<RNTextInput | null>(null);

  const code = value ?? internal;

  const handleChange = (text: string) => {
    const clean = text.replace(/[^0-9]/g, "").slice(0, length);
    if (value == null) {
      setInternal(clean);
    }
    onChange?.(clean);
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <View>
      {/* Input invisible qui reçoit le clavier */}
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        keyboardType="number-pad"
        value={code}
        onChangeText={handleChange}
        maxLength={length}
      />

      {/* Cases affichées */}
      <View style={styles.boxRow}>
        {Array.from({ length }).map((_, index) => {
          const digit = code[index] ?? "";
          const isActive = index === code.length;

          return (
            <View
              key={index}
              style={[styles.box, isActive && styles.boxActive]}
            >
              <Text style={styles.digit}>{digit}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    height: 0,
    width: 0,
  },
  boxRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 24,
  },
  box: {
    width: 56,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  boxActive: {
    borderColor: Palette.bgWhite,
  },
  digit: {
    ...Typography.title1Bold,
    color: Palette.bgWhite,
  },
});

export default CodeInput;
