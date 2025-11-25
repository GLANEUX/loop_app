import { Typography } from "@/constants/theme";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Provider = "facebook" | "apple" | "google";

interface SocialAuthSectionProps {
  showDivider?: boolean;
  onSelect?: (provider: Provider) => void;
}

export const SocialAuthSection: React.FC<SocialAuthSectionProps> = ({
  showDivider = true,
  onSelect,
}) => {
  const handlePress = (provider: Provider) => {
    onSelect?.(provider);
  };

  return (
    <View style={styles.container}>
      {/* Divider */}
      {showDivider && (
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Ou continuez avec</Text>
          <View style={styles.dividerLine} />
        </View>
      )}

      {/* Icons */}
      <View style={styles.socialRow}>
        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => handlePress("facebook")}
        >
          <Image
            source={require("@/assets/icons/social/facebook.png")}
            style={styles.socialIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => handlePress("apple")}
        >
          <Image
            source={require("@/assets/icons/social/apple.png")}
            style={styles.socialIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => handlePress("google")}
        >
          <Image
            source={require("@/assets/icons/social/google.png")}
            style={styles.socialIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },

  /* Divider */
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  dividerText: {
    ...Typography.bodyBold,
    color: "rgba(255,255,255,0.9)",
    marginHorizontal: 12,
  },

  /* Social row */
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 30,
  },
  socialButton: {
    width: 40,
    height: 40,

    alignItems: "center",
    justifyContent: "center",
  },
  socialIcon: {
    width: 40,
    height: 40,
  },
});

export default SocialAuthSection;
