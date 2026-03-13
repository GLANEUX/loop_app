// src/screens/onboarding/UploadTracksScreen.tsx
import { OnboardingLayout } from "@/components/layout";
import { ButtonLoop } from "@/components/ui";
import { Palette, Typography } from "@/constants/theme";
import { formatApiError } from "@/lib/api";
import { uploadMedia } from "@/lib/media";
import { getAccessToken } from "@/lib/session";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Audio } from "expo-av";

import PlayIcon from "@/assets/icons/icons/mdi-play-1.svg";
import TrashIcon from "@/assets/icons/icons/trash-outline-white.svg";

type PickedFile = {
  name: string;
  size?: number | null;
  uri: string;
  mimeType?: string | null;
};

const PauseIcon = ({ width = 24, height = 24, color = "white" }: { width?: number; height?: number; color?: string }) => (
  <View style={{ width, height, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 3 }}>
    <View style={{ width: 4, height: 14, backgroundColor: color, borderRadius: 2 }} />
    <View style={{ width: 4, height: 14, backgroundColor: color, borderRadius: 2 }} />
  </View>
);

export const UploadTracksScreen: React.FC = () => {
  const router = useRouter();
  const [file, setFile] = useState<PickedFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const stopSound = async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
    }
  };

  const togglePlayback = async () => {
    try {
      if (!file) return;

      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
        return;
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: file.uri },
        { shouldPlay: true }
      );

      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          newSound.setPositionAsync(0);
        }
      });
    } catch (err) {
      console.error("Playback error:", err);
      setError("Impossible de lire le fichier.");
    }
  };

  const handlePickFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: false,
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
      
      await stopSound();

      const asset = result.assets[0];
      setFile({
        name: asset.name ?? "Fichier sans nom",
        size: asset.size,
        uri: asset.uri,
        mimeType: asset.mimeType,
      });
      setError(null);
    } catch (err) {
      console.error("Erreur lors de la sélection de fichiers :", err);
      setError("Impossible de sélectionner le fichier.");
    }
  };

  const handleDelete = async () => {
    await stopSound();
    setFile(null);
  };

  const handleContinue = async () => {
    if (!file) {
      setError("Tu dois ajouter au moins une composition pour continuer.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Session expirée");

      // For compositions, we always send as "audio" type 
      // even if it's an mp4 container, to ensure server-side compatibility.
      await uploadMedia({
        uri: file.uri,
        name: file.name,
        type: "audio",
        mimeType: file.mimeType || undefined,
      }, token);

      router.push("/upload-success");
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout
      imageSource={require("@/assets/images/auth/background-3.png")}
      progress={0.9}
    >
      <Text style={styles.title}>
        Ajoute un extrait de ta meilleure composition
      </Text>
      <Text style={styles.subtitle}>Fais-nous découvrir ton univers (obligatoire).</Text>

      {/* disque */}
      {!file && (
        <View style={styles.discWrapper}>
          <View style={styles.discOuter}>
            <View style={styles.discInner} />
          </View>
        </View>
      )}

      {/* Preview Card */}
      {file && (
        <View style={styles.previewCard}>
          <TouchableOpacity 
            style={styles.playButton} 
            onPress={togglePlayback}
          >
            {isPlaying ? (
              <PauseIcon width={24} height={24} color={Palette.primary} />
            ) : (
              <PlayIcon width={28} height={28} color={Palette.bgWhite} />
            )}
          </TouchableOpacity>
          
          <View style={styles.fileInfo}>
            <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
            <Text style={styles.fileSize}>
              {file.size ? (file.size / (1024 * 1024)).toFixed(2) + " MB" : "Audio"}
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={handleDelete}
          >
            <TrashIcon width={20} height={20} color={Palette.primary} />
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.helper}>Fichiers en mp3, mp4, mov ou wav</Text>
      
      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.buttonWrapper}>
        {!file && (
          <ButtonLoop
            label="Ajoute ton son pour collaborer"
            onPress={handlePickFiles}
            style={{ marginBottom: 12 }}
          />
        )}

        <ButtonLoop 
          label="Continuer" 
          onPress={handleContinue} 
          loading={loading}
          disabled={!file}
        />
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
    marginBottom: 32,
  },
  discWrapper: {
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  discOuter: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 7,
    borderColor: Palette.bgWhite,
    justifyContent: "center",
    alignItems: "center",
  },
  discInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 7,
    borderColor: Palette.bgWhite,
  },
  previewCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    ...Typography.bodyBold,
    color: Palette.bgWhite,
  },
  fileSize: {
    ...Typography.smallLight,
    color: Palette.grey300,
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
  helper: {
    ...Typography.bodyRegular,
    color: Palette.bgWhite,
    textAlign: "center",
    marginBottom: 16,
  },
  errorText: {
    ...Typography.smallLight,
    color: Palette.primary,
    textAlign: "center",
    marginBottom: 16,
  },
  buttonWrapper: {
    marginTop: 8,
  },
});

export default UploadTracksScreen;
