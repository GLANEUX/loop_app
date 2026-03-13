import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";

import BackIcon from "@/assets/icons/icons/direction-left-2-outline-white.svg";
import TrashIcon from "@/assets/icons/icons/close-outline-white.svg";
import { ButtonLoop } from "@/components/ui";
import { Palette, Typography } from "@/constants/theme";
import { formatApiError } from "@/lib/api";
import { uploadMedia } from "@/lib/media";
import { getAccessToken } from "@/lib/session";

type PickedFile = {
  name: string;
  size?: number | null;
  uri: string;
  mimeType?: string | null;
};

export default function MediaEditScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [files, setFiles] = useState<PickedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePickFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: true,
        copyToCacheDirectory: true,
        type: [
          "audio/*",
          "video/*",
          "audio/mpeg",
          "audio/wav",
          "audio/mp4",
          "video/mp4",
          "video/quicktime",
        ],
      });

      if (result.canceled) return;

      const picked = result.assets.map((asset) => ({
        name: asset.name ?? "Fichier sans nom",
        size: asset.size,
        uri: asset.uri,
        mimeType: asset.mimeType,
      }));

      setFiles((prev) => [...prev, ...picked]);
    } catch (err) {
      console.error("Erreur lors de la sélection de fichiers :", err);
      setError("Impossible de sélectionner les fichiers.");
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!files.length) {
      router.back();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Session expirée");

      for (const file of files) {
        // Many mobile devices record audio in mp4 containers. 
        // We prioritize "audio" type unless it's explicitly a video-only format like .mov
        const isVideo =
          file.name.toLowerCase().endsWith(".mov") ||
          (file.mimeType?.startsWith("video") && !file.name.toLowerCase().endsWith(".mp4"));

        await uploadMedia(
          {
            uri: file.uri,
            name: file.name,
            type: isVideo ? "video" : "audio",
            mimeType: file.mimeType || undefined,
          },
          token,
        );
      }

      router.back();
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={router.back}>
          <BackIcon
            width={24}
            height={24}
            style={{ transform: [{ scaleX: -1 }] }}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajouter des médias</Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.description}>
          Ajoute des extraits de tes compositions (audio ou vidéo) pour enrichir ton profil.
        </Text>

        {!!error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.uploadBox} onPress={handlePickFiles}>
          <View style={styles.discOuter}>
            <View style={styles.discInner} />
          </View>
          <Text style={styles.uploadText}>Parcourir mes fichiers</Text>
          <Text style={styles.uploadSubtext}>MP3, WAV, MP4, MOV</Text>
        </TouchableOpacity>

        {files.length > 0 && (
          <View style={styles.filesList}>
            <Text style={styles.filesListTitle}>Fichiers sélectionnés :</Text>
            {files.map((file, index) => (
              <View key={index} style={styles.fileRow}>
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {file.name}
                  </Text>
                  <Text style={styles.fileType}>
                    {file.mimeType?.split("/")[1]?.toUpperCase() || "FICHIER"}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => removeFile(index)}
                  style={styles.removeButton}
                >
                  <TrashIcon width={20} height={20} color={Palette.primary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <ButtonLoop
          label={files.length > 0 ? "Enregistrer" : "Annuler"}
          onPress={handleSave}
          loading={loading}
          variant={files.length > 0 ? "primary" : "outline"}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.bgBlack,
  },
  header: {
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  backButton: {
    position: "absolute",
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  headerTitle: {
    ...Typography.title2Bold,
    color: Palette.bgWhite,
    fontSize: 20,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 100,
  },
  description: {
    ...Typography.bodyRegular,
    color: Palette.grey300,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  uploadBox: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderStyle: "dashed",
    padding: 40,
    alignItems: "center",
    marginBottom: 32,
  },
  discOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: Palette.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    opacity: 0.8,
  },
  discInner: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 3,
    borderColor: Palette.primary,
  },
  uploadText: {
    ...Typography.bodyBold,
    color: Palette.bgWhite,
    marginBottom: 4,
  },
  uploadSubtext: {
    ...Typography.smallLight,
    color: Palette.grey500,
  },
  filesList: {
    gap: 12,
  },
  filesListTitle: {
    ...Typography.smallSemibold,
    color: Palette.grey400,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    ...Typography.bodyMedium,
    color: Palette.bgWhite,
  },
  fileType: {
    ...Typography.smallLight,
    color: Palette.primary,
    fontSize: 10,
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: Palette.bgBlack,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  errorBanner: {
    backgroundColor: "rgba(238, 40, 59, 0.1)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(238, 40, 59, 0.2)",
  },
  errorText: {
    ...Typography.smallLight,
    color: Palette.error,
    textAlign: "center",
  },
});
