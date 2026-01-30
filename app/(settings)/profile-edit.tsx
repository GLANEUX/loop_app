import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BackIcon from "@/assets/icons/icons/arrow-right-outline-white.svg";
import EditAvatarIcon from "@/assets/icons/icons/edit-outline-white.svg";
import { ButtonLoop } from "@/components/ui";
import { Env } from "@/constants/env";
import { Palette, Typography } from "@/constants/theme";
import { formatApiError } from "@/lib/api";
import { getAccessToken } from "@/lib/session";
import { getMyProfileCached, updateMyAvatar, updateMyProfile, UserMe } from "@/lib/user";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";

const fallbackAvatar = require("@/assets/images/landing/landing-9.jpg");

export default function ProfileEditScreen() {
  const [user, setUser] = useState<UserMe | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [avatarLocalUri, setAvatarLocalUri] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const [pseudoInput, setPseudoInput] = useState("");
  const [bioInput, setBioInput] = useState("");
  const [birthDateInput, setBirthDateInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const fetchProfile = useCallback(async (force = false) => {
    setLoadingProfile(true);
    setProfileError(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        setLoadingProfile(false);
        return;
      }
      setToken(token);
      const data = await getMyProfileCached(token, force);
      setUser(data);
    } catch (err) {
      setProfileError(formatApiError(err));
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile(false);
  }, [fetchProfile]);

  useFocusEffect(
    useCallback(() => {
      fetchProfile(true);
    }, [fetchProfile]),
  );

  const profile = user?.profile;
  const pseudo = user?.pseudo || "johndoe21";
  const bio =
    profile?.bio?.trim().length ? profile.bio : "Parlez-nous un peu de vous !";

  useEffect(() => {
    if (!user || isEditing) return;
    setPseudoInput(user?.pseudo || "");
    setBioInput(profile?.bio || "");
    setBirthDateInput(profile?.birthDate || "");
  }, [user, profile?.bio, profile?.birthDate, isEditing]);

  const instruments = (profile?.instruments ?? [])
    .map((item) =>
      item.level ? `${item.instrument} · ${item.level}` : item.instrument,
    )
    .filter(Boolean);
  const genres = (profile?.genres ?? []).filter(Boolean);

  const instrumentsToShow =
    instruments.length > 0
      ? instruments
      : ["Guitare · Intermediate", "Piano · Intermediate", "Voix · Intermediate"];
  const genresToShow = genres.length > 0 ? genres : ["Jazz", "Soul"];

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
        : fallbackAvatar;

  const handleChangeAvatar = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: false,
        copyToCacheDirectory: true,
        type: ["image/*"],
      });

      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset?.uri) {
        setProfileError("Impossible de récupérer l'image.");
        return;
      }

      const originalUri = asset.uri;
      let finalUri = originalUri;
      const fileName = asset.name ?? `avatar-${Date.now()}`;

      if (originalUri.startsWith("content://") && FileSystem.cacheDirectory) {
        const dest = `${FileSystem.cacheDirectory}${fileName}`;
        await FileSystem.copyAsync({ from: originalUri, to: dest });
        finalUri = dest;
      }

      if (!token) {
        setProfileError("Tu dois être connecté pour continuer.");
        return;
      }

      setAvatarLoading(true);
      await updateMyAvatar(
        {
          uri: finalUri,
          name: fileName,
          type: asset.mimeType ?? "image/jpeg",
        },
        token,
      );
      await fetchProfile(true);
    } catch (err) {
      setProfileError(formatApiError(err));
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSubmitError(null);
    try {
      if (!token) {
        setSubmitError("Tu dois être connecté pour continuer.");
        return;
      }
      await updateMyProfile(
        {
          bio: bioInput.trim() ? bioInput.trim() : null,
          birthDate: birthDateInput.trim() ? birthDateInput.trim() : null,
          pseudo: pseudoInput.trim() ? pseudoInput.trim() : undefined,
        },
        token,
      );
      setIsEditing(false);
      await fetchProfile(true);
    } catch (err) {
      setSubmitError(formatApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={router.back}>
            <BackIcon
              width={22}
              height={22}
              style={{ transform: [{ scaleX: -1 }] }}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editer le profil</Text>
        </View>

        <View style={styles.avatarBlock}>
          <View style={styles.avatarWrapper}>
            <Image source={avatarSource} style={styles.avatar} />
            <TouchableOpacity
              style={styles.avatarEditButton}
              onPress={handleChangeAvatar}
              disabled={avatarLoading}
            >
              <EditAvatarIcon width={22} height={22} />
            </TouchableOpacity>
          </View>
        </View>

        {!!profileError && <Text style={styles.errorText}>{profileError}</Text>}
        {loadingProfile && (
          <Text style={styles.statusText}>Chargement...</Text>
        )}
        {!!submitError && <Text style={styles.submitErrorText}>{submitError}</Text>}

        <View style={styles.formCard}>
          <EditableRow label="Pseudo">
            <TextInput
              style={styles.input}
              value={pseudoInput}
              onChangeText={(value) => {
                setIsEditing(true);
                setPseudoInput(value);
              }}
              placeholder={pseudo}
              placeholderTextColor={Palette.grey600}
            />
          </EditableRow>
          <EditableRow label="Biographie" multiline>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={bioInput}
              onChangeText={(value) => {
                setIsEditing(true);
                setBioInput(value);
              }}
              placeholder={bio}
              placeholderTextColor={Palette.grey600}
              multiline
              textAlignVertical="top"
            />
          </EditableRow>
          <EditableRow label="Date de naissance" isLast>
            <TextInput
              style={styles.input}
              value={birthDateInput}
              onChangeText={(value) => {
                setIsEditing(true);
                setBirthDateInput(value);
              }}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Palette.grey600}
            />
          </EditableRow>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Instruments</Text>
            <TouchableOpacity
              style={styles.sectionEditButton}
              onPress={() => router.push("/(settings)/skills-edit")}
            >
              <EditAvatarIcon width={20} height={20} />
            </TouchableOpacity>
          </View>
          <View style={styles.chipsRow}>
            {instrumentsToShow.map((label) => (
              <Chip key={label} label={label} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Styles musicaux</Text>
            <TouchableOpacity
              style={styles.sectionEditButton}
              onPress={() => router.push("/(settings)/styles-edit")}
            >
              <EditAvatarIcon width={20} height={20} />
            </TouchableOpacity>
          </View>
          <View style={styles.chipsRow}>
            {genresToShow.map((label) => (
              <Chip key={label} label={label} />
            ))}
          </View>
        </View>

        <ButtonLoop
          label="Enregistrer"
          onPress={handleSave}
          loading={saving}
          style={styles.saveButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

type ChipProps = {
  label: string;
};

const Chip: React.FC<ChipProps> = ({ label }) => (
  <View style={styles.chip}>
    <Text style={styles.chipText}>{label}</Text>
  </View>
);

type EditableRowProps = {
  label: string;
  isLast?: boolean;
  multiline?: boolean;
  children: React.ReactNode;
};

const EditableRow: React.FC<EditableRowProps> = ({
  label,
  isLast,
  multiline,
  children,
}) => {
  return (
    <View
      style={[
        styles.profileRow,
        multiline && styles.profileRowMultiline,
        isLast && styles.profileRowLast,
      ]}
    >
      <Text style={styles.profileLabel}>{label}</Text>
      <View
        style={[
          styles.profileValueWrap,
          multiline && styles.profileValueWrapMultiline,
        ]}
      >
        {children}
      </View>
    </View>
  );
};

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
    paddingBottom: 48,
  },
  header: {
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    left: 0,
    width: 32,
    height: 32,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  headerTitle: {
    ...Typography.title2Bold,
    color: Palette.bgWhite,
  },
  avatarBlock: {
    marginTop: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 22,
  },
  avatarEditButton: {
    position: "absolute",
    right: -10,
    bottom: -10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Palette.bgBlack,
  },
  statusText: {
    marginTop: 12,
    ...Typography.bodyMedium,
    color: Palette.grey300,
    textAlign: "center",
  },
  errorText: {
    marginTop: 12,
    ...Typography.bodyMedium,
    color: Palette.primary,
    textAlign: "center",
  },
  formCard: {
    marginTop: 30,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  profileRow: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  profileRowMultiline: {
    alignItems: "flex-start",
  },
  profileRowLast: {
    borderBottomWidth: 0,
  },
  profileLabel: {
    ...Typography.bodyBold,
    color: Palette.bgWhite,
  },
  profileValueWrap: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
  },
  profileValueWrapMultiline: {
    alignItems: "flex-start",
  },
  input: {
    ...Typography.bodyMedium,
    color: Palette.primary,
    textAlign: "right",
    flexShrink: 1,
    minWidth: 140,
  },
  inputMultiline: {
    minHeight: 70,
    textAlign: "left",
  },
  section: {
    marginTop: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionEditButton: {
    padding: 6,
  },
  sectionTitle: {
    ...Typography.title3Bold,
    color: Palette.bgWhite,
  },
  chipsRow: {
    marginTop: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  chip: {
    backgroundColor: Palette.bgWhite,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  chipText: {
    ...Typography.bodyMedium,
    color: Palette.grey800,
  },
  submitErrorText: {
    marginTop: 10,
    ...Typography.smallLight,
    color: Palette.primary,
    textAlign: "center",
  },
  saveButton: {
    marginTop: 34,
    alignSelf: "center",
    paddingHorizontal: 40,
  },
});
