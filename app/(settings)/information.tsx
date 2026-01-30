import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BackIcon from "@/assets/icons/icons/arrow-right-outline-white.svg";
import { ButtonLoop } from "@/components/ui";
import { Palette, Typography } from "@/constants/theme";
import { formatApiError } from "@/lib/api";
import { getAccessToken } from "@/lib/session";
import { getMyProfileCached, UserMe } from "@/lib/user";

export default function InformationScreen() {
  const [user, setUser] = useState<UserMe | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    let active = true;
    const fetchProfile = async () => {
      setLoadingProfile(true);
      setProfileError(null);
      try {
        const token = await getAccessToken();
        if (!token) {
          if (active) setLoadingProfile(false);
          return;
        }
        const data = await getMyProfileCached(token);
        if (active) setUser(data);
      } catch (err) {
        if (active) setProfileError(formatApiError(err));
      } finally {
        if (active) setLoadingProfile(false);
      }
    };

    fetchProfile();
    return () => {
      active = false;
    };
  }, []);

  const email = user?.email || "johndoe21@gmail.com";
  const phone = user?.profile?.phoneNumber || "+33678439376";

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
          <Text style={styles.headerTitle}>Informations</Text>
        </View>

        {loadingProfile && (
          <Text style={styles.statusText}>Chargement...</Text>
        )}
        {profileError && <Text style={styles.errorText}>{profileError}</Text>}

        <View style={styles.formCard}>
          <InfoRow label="E-mail" value={email} />
          <InfoRow label="E-mail" value={phone} />
          <EditableRow label="Mot de passe actuel">
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="••••••"
              placeholderTextColor={Palette.grey600}
              secureTextEntry
            />
          </EditableRow>
          <EditableRow label="Nouveau mot de passe">
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Insérez..."
              placeholderTextColor={Palette.grey600}
              secureTextEntry
            />
          </EditableRow>
          <EditableRow label="Confirmez" isLast>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Insérez..."
              placeholderTextColor={Palette.grey600}
              secureTextEntry
            />
          </EditableRow>
        </View>

        <ButtonLoop label="Enregistrer" onPress={() => {}} style={styles.save} />

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => router.push("/(settings)/delete-account")}
          activeOpacity={0.85}
        >
          <Text style={styles.deleteText}>Supprimer mon compte</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

type InfoRowProps = {
  label: string;
  value: string;
  isLast?: boolean;
};

const InfoRow: React.FC<InfoRowProps> = ({ label, value, isLast }) => (
  <View style={[styles.row, isLast && styles.rowLast]}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

type EditableRowProps = {
  label: string;
  isLast?: boolean;
  children: React.ReactNode;
};

const EditableRow: React.FC<EditableRowProps> = ({
  label,
  isLast,
  children,
}) => (
  <View style={[styles.row, isLast && styles.rowLast]}>
    <Text style={styles.rowLabel}>{label}</Text>
    <View style={styles.rowInputWrap}>{children}</View>
  </View>
);

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
  row: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    ...Typography.bodyBold,
    color: Palette.bgWhite,
  },
  rowValue: {
    ...Typography.bodyMedium,
    color: Palette.primary,
    textAlign: "right",
    flexShrink: 1,
  },
  rowInputWrap: {
    flex: 1,
    alignItems: "flex-end",
  },
  input: {
    ...Typography.bodyMedium,
    color: Palette.grey600,
    textAlign: "right",
    minWidth: 140,
  },
  save: {
    marginTop: 34,
    alignSelf: "center",
    paddingHorizontal: 40,
    backgroundColor: Palette.grey100,
  },
  deleteButton: {
    marginTop: 22,
    alignSelf: "center",
    paddingHorizontal: 38,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: "#4A0E14",
  },
  deleteText: {
    ...Typography.bodyBold,
    color: "#E53A3A",
  },
});
