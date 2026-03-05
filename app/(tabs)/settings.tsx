// app/profile-settings.tsx (par ex.)

import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Env } from "@/constants/env";
import { Palette, Typography } from "@/constants/theme";
import { formatApiError } from "@/lib/api";
import { logout } from "@/lib/auth";
import { clearSession, getAccessToken } from "@/lib/session";
import { getMyProfileCached, UserMe } from "@/lib/user";
import * as FileSystem from "expo-file-system/legacy";

import RightChevronIcon from "@/assets/icons/icons/direction-right-2-outline-white.svg";
import EyeIcon from "@/assets/icons/icons/eye-1.svg";
import InfoIcon from "@/assets/icons/icons/information-circle-outline-white.svg";
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
  const [user, setUser] = useState<UserMe | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [avatarLocalUri, setAvatarLocalUri] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      const token = await getAccessToken();
      if (token) {
        await logout(token);
      }
    } catch (err) {
      Alert.alert("Erreur", formatApiError(err));
    } finally {
      await clearSession();
      setLoggingOut(false);
      router.replace("/authPage");
    }
  };

  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);
    setProfileError(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        setLoadingProfile(false);
        return;
      }
      setToken(token);
      const data = await getMyProfileCached(token, true);
      setUser(data);
    } catch (err) {
      setProfileError(formatApiError(err));
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile]),
  );

  const profile = user?.profile;
  const displayName = useMemo(() => {
    const parts = [profile?.firstName, profile?.lastName].filter(Boolean);
    if (parts.length > 0) return parts.join(" ");
    return user?.pseudo || "Utilisateur";
  }, [profile?.firstName, profile?.lastName, user?.pseudo]);

  const handle = user?.pseudo ? `@${user.pseudo}` : user?.email || "";

  const avatarUriBase =
    profile?.hasAvatar === false
      ? null
      : profile?.avatarUrl
        ? profile.avatarUrl
        : profile?.hasAvatar === true
          ? `${Env.API_URL}/user/me/avatar`
          : null;
  const avatarVersion = profile?.updatedAt || "";
  const avatarUri =
    avatarUriBase && avatarVersion
      ? `${avatarUriBase}?v=${encodeURIComponent(avatarVersion)}`
      : avatarUriBase;

  useEffect(() => {
    let active = true;
    const downloadAvatar = async () => {
      if (!token || !profile?.hasAvatar || !avatarUri) {
        if (active) setAvatarLocalUri(null);
        return;
      }
      const cacheDir = FileSystem.cacheDirectory;
      if (!cacheDir) return;
      const safeVersion = avatarVersion
        ? encodeURIComponent(avatarVersion)
        : "latest";
      const fileUri = `${cacheDir}avatar-${user?.id ?? "me"}-${safeVersion}.img`;

      try {
        const info = await FileSystem.getInfoAsync(fileUri);
        if (info.exists) {
          if (active) setAvatarLocalUri(fileUri);
          return;
        }
        const result = await FileSystem.downloadAsync(avatarUri, fileUri, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (active && result?.uri) {
          setAvatarLocalUri(result.uri);
        }
      } catch {
        if (active) setAvatarLocalUri(null);
      }
    };
    downloadAvatar();
    return () => {
      active = false;
    };
  }, [token, profile?.hasAvatar, avatarUri, avatarVersion, user?.id]);

  const avatarSource = avatarLocalUri
    ? { uri: avatarLocalUri }
    : avatarUri && token
      ? { uri: avatarUri, headers: { Authorization: `Bearer ${token}` } }
      : avatarUri
        ? { uri: avatarUri }
        : require("@/assets/images/landing/landing-9.jpg");

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header user */}
        <View style={styles.userHeader}>
          <Image source={avatarSource} style={styles.avatar} />
          <View style={styles.userInfoWrap}>
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => router.push("/profile")}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <EyeIcon width={22} height={22} />
            </TouchableOpacity>
            <View style={styles.userTextBlock}>
              <Text style={styles.name}>{displayName}</Text>
              {!!handle && <Text style={styles.handle}>{handle}</Text>}
              {loadingProfile && (
                <Text style={styles.statusText}>Chargement...</Text>
              )}
              {profileError && (
                <Text style={styles.errorText}>{profileError}</Text>
              )}
            </View>
          </View>
        </View>
        {/* Bloc principal de lignes */}
        <View style={styles.rowsGroup}>
          <SettingsRow
            label="Informations"
            Icon={InfoIcon}
            onPress={() => router.push("/information")}
          />
          <SettingsRow
            label="Editer le profil"
            Icon={UserIcon}
            onPress={() => router.push("/profile-edit")}
          />
          {/* TODO: <SettingsRow
            label="Notifications"
            Icon={BellIcon}
            onPress={() => router.push("/notifications")}
          /> */}
          {/* <SettingsRow label="Gérer mon abonnement" Icon={PlayIcon} /> */}
        </View>
        {/* TODO: <View style={styles.rowsGroupSecondary}>
          <SettingsRow label="Aide et support" />
          <SettingsRow label="Conditions d’utilisation" />
        </View> */}
        {/* TODO: Add onPress handlers */}
        <ButtonLoop
          label="Se déconnecter"
          onPress={handleLogout}
          loading={loggingOut}
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
  eyeButton: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Header user */
  userHeader: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 20,
  },
  userInfoWrap: {
    marginLeft: 16,
    flex: 1,
    minHeight: 110,
    justifyContent: "center",
    paddingRight: 52,
  },
  userTextBlock: {
    justifyContent: "center",
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
  statusText: {
    marginTop: 6,
    ...Typography.bodyMedium,
    color: Palette.grey300,
  },
  errorText: {
    marginTop: 6,
    ...Typography.bodyMedium,
    color: Palette.primary,
  },

  profileInfoCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: 18,
    backgroundColor: Palette.opacityBackground,
    gap: 10,
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
