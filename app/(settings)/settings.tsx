// app/(tabs)/profile-settings.tsx (par ex.)

import { router } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Palette, Typography } from "@/constants/theme";

import BackIcon from "@/assets/icons/icons/arrow-right-outline-white.svg";
import RightChevronIcon from "@/assets/icons/icons/direction-right-2-outline-white.svg";
import InfoIcon from "@/assets/icons/icons/information-circle-outline-white.svg";
import PlayIcon from "@/assets/icons/icons/mdi-play-1.svg";
import BellIcon from "@/assets/icons/icons/notification-2-outline-white.svg";
import UserIcon from "@/assets/icons/icons/user-outline-white.svg";
import { ButtonLoop } from "@/components/ui";

type SvgIcon = React.ComponentType<{ width?: number; height?: number }>;

type SettingsRowProps = {
  label: string;
  Icon?: SvgIcon;
  onPress?: () => void;
};

const SettingsRow: React.FC<SettingsRowProps> = ({ label, Icon, onPress }) => {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={styles.rowLeft}>
        {Icon && (
          <View style={styles.rowIconWrapper}>
            <Icon width={22} height={22} />
          </View>
        )}
        <Text style={styles.rowLabel}>{label}</Text>
      </View>

      <RightChevronIcon width={20} height={20} />
    </TouchableOpacity>
  );
};

export const ProfileSettingsScreen: React.FC = () => {
  const username = "Léa Martin";
  const handle = "@leamartin89";
  const handleOnClic = () => {
    router.replace("/(tabs)/profile");
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <TouchableOpacity style={styles.backButton} onPress={handleOnClic}>
          <BackIcon
            width={22}
            height={22}
            style={{ transform: [{ scaleX: -1 }] }}
          />
        </TouchableOpacity>

        {/* Header user */}
        <View style={styles.userHeader}>
          <Image
            source={require("@/assets/images/landing/landing-9.jpg")}
            style={styles.avatar}
          />
          <View style={styles.userTextBlock}>
            <Text style={styles.name}>{username}</Text>
            <Text style={styles.handle}>{handle}</Text>
          </View>
        </View>

        {/* Bloc principal de lignes */}
        <View style={styles.rowsGroup}>
          <SettingsRow label="Informations" Icon={InfoIcon} />
          <SettingsRow label="Editer le profil" Icon={UserIcon} />
          <SettingsRow label="Notifications" Icon={BellIcon} />
          <SettingsRow label="Gérer mon abonnement" Icon={PlayIcon} />
        </View>

        <View style={styles.rowsGroupSecondary}>
          <SettingsRow label="Aide et support" />
          <SettingsRow label="Conditions d’utilisation" />
        </View>

        <ButtonLoop
          label="Se déconnecter"
          onPress={() => {}}
          style={styles.logoutButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileSettingsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.bgBlack,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  /* Back */
  backButton: {
    marginTop: 8,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "flex-start",
  },

  /* Header user */
  userHeader: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 20,
  },
  userTextBlock: {
    marginLeft: 16,
  },
  name: {
    ...Typography.title2Bold,
    color: Palette.bgWhite,
  },
  handle: {
    marginTop: 4,
    ...Typography.bodyMedium,
    color: Palette.grey600,
  },

  /* Rows */
  rowsGroup: {
    marginTop: 40,
    gap: 24,
  },
  rowsGroupSecondary: {
    marginTop: 40,
    gap: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowIconWrapper: {
    width: 32,
    alignItems: "flex-start",
  },
  rowLabel: {
    ...Typography.bodyMedium,
    color: Palette.bgWhite,
  },

  /* Logout button */
  logoutButton: {
    marginTop: 56,
    alignSelf: "center",
    paddingHorizontal: 40,
  },
  logoutText: {
    ...Typography.bodyBold,
    color: Palette.bgWhite,
  },
});
