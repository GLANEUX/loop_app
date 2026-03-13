// src/screens/onboarding/AvatarScreen.tsx
import { OnboardingLayout } from "@/components/layout";
import { ButtonLoop } from "@/components/ui";
import { Palette, Typography } from "@/constants/theme";
import { formatApiError } from "@/lib/api";
import { getAccessToken } from "@/lib/session";
import { updateMyAvatar } from "@/lib/user";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

type PickedImage = {
  name: string;
  uri: string;
  type?: string | null;
  size?: number | null;
};

export const AvatarScreen: React.FC = () => {
  const router = useRouter();
  const [selected, setSelected] = useState<PickedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        setError("La permission d'accès aux photos est requise.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      if (!asset?.uri) {
        setError("Impossible de récupérer l'image.");
        return;
      }

      const originalUri = asset.uri;
      const fileName = asset.fileName ?? `avatar-${Date.now()}.jpg`;

      const info = await FileSystem.getInfoAsync(originalUri);

      setSelected({
        name: fileName,
        uri: originalUri,
        type: asset.mimeType ?? "image/jpeg",
        size: info.exists ? info.size ?? null : null,
      });
      if (error) setError(null);
    } catch (err) {
      setError(formatApiError(err));
    }
  };

  const handleContinue = async () => {
    if (!selected?.uri) {
      setError("Ajoute un avatar pour continuer.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        setError("Tu dois être connecté pour continuer.");
        return;
      }

      console.log("[avatar] upload payload", {
        uri: selected.uri,
        name: selected.name,
        type: selected.type ?? "image/jpeg",
        size: selected.size ?? null,
      });

      await updateMyAvatar(selected, token);
      router.push("/bio");
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout
      imageSource={require("@/assets/images/auth/background-5.png")}
      progress={0.8}
    >
      <Text style={styles.title}>Choisis un avatar</Text>
      <Text style={styles.subtitle}>
        Une photo aide la communauté à mieux te reconnaître.
      </Text>

      <View style={styles.avatarWrapper}>
        {selected?.uri ? (
          <Image source={{ uri: selected.uri }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.placeholderText}>Aucun avatar</Text>
          </View>
        )}
      </View>

      {selected?.name && <Text style={styles.fileName}>{selected.name}</Text>}
      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.buttonWrapper}>
        <ButtonLoop
          label={selected ? "Changer d'avatar" : "Ajouter un avatar"}
          onPress={handlePickImage}
          style={{ marginBottom: 12 }}
        />
        <ButtonLoop label="Continuer" onPress={handleContinue} loading={loading} />
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  title: {
    ...Typography.title1Bold,
    color: Palette.bgWhite,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.bodyRegular,
    color: Palette.bgWhite,
    marginBottom: 24,
  },
  avatarWrapper: {
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: Palette.bgWhite,
  },
  avatarPlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  placeholderText: {
    ...Typography.bodyRegular,
    color: Palette.grey300,
  },
  fileName: {
    ...Typography.smallLight,
    color: Palette.bgWhite,
    textAlign: "center",
    marginBottom: 8,
  },
  errorText: {
    ...Typography.smallLight,
    color: Palette.primary,
    textAlign: "center",
    marginBottom: 12,
  },
  buttonWrapper: {
    marginTop: 8,
  },
});

export default AvatarScreen;
