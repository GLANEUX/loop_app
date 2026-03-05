// src/screens/onboarding/UploadTracksScreen.tsx
import { OnboardingLayout } from "@/components/layout";
import { ButtonLoop } from "@/components/ui";
import { Palette, Typography } from "@/constants/theme";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

type PickedFile = {
  name: string;
  size?: number | null;
  uri: string;
  mimeType?: string | null;
};

export const UploadTracksScreen: React.FC = () => {
  const router = useRouter();
  const [files, setFiles] = useState<PickedFile[]>([]);

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
      console.log("Fichiers sélectionnés :", picked);
    } catch (err) {
      console.error("Erreur lors de la sélection de fichiers :", err);
    }
  };

  const handleContinue = () => {
    // if (!files.length) {
    //   console.log("Aucun fichier, tu peux afficher une erreur si tu veux.");
    //   return;
    // }

    // TODO: upload vers ton backend / storage ici
    console.log("Onboarding – fichiers à envoyer :", files);
    router.push("/upload-success");
  };

  return (
    <OnboardingLayout
      imageSource={require("@/assets/images/auth/background-3.png")}
      progress={0.95}
    >
      <Text style={styles.title}>
        Ajoute un ou plusieurs extraits de tes compositions
      </Text>
      <Text style={styles.subtitle}>Fais-nous découvrir ton univers.</Text>

      {/* disque */}
      <View style={styles.discWrapper}>
        <View style={styles.discOuter}>
          <View style={styles.discInner} />
        </View>
      </View>

      <Text style={styles.helper}>Fichiers en mp3, mp4, mov ou wav</Text>

      {/* Liste des fichiers sélectionnés */}
      {files.length > 0 && (
        <View style={styles.filesContainer}>
          {files.map((file, index) => (
            <Text key={index} style={styles.fileItem}>
              • {file.name}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.buttonWrapper}>
        <ButtonLoop
          label="Ajoute ton son pour collaborer"
          onPress={handlePickFiles}
          style={{ marginBottom: 12 }}
        />

        <ButtonLoop label="Continuer" onPress={handleContinue} />
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
  helper: {
    ...Typography.bodyRegular,
    color: Palette.bgWhite,
    textAlign: "center",
    marginBottom: 16,
  },
  filesContainer: {
    marginBottom: 16,
  },
  fileItem: {
    ...Typography.smallLight,
    color: Palette.bgWhite,
  },
  buttonWrapper: {
    marginTop: 8,
  },
});

export default UploadTracksScreen;
