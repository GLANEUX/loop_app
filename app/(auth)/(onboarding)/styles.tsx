// src/screens/onboarding/StylesScreen.tsx

import { OnboardingLayout, TagChip } from "@/components/layout";
import { ButtonLoop } from "@/components/ui";
import { Palette, Typography } from "@/constants/theme";
import { formatApiError } from "@/lib/api";
import { getGenres, Genre } from "@/lib/catalog";
import { getAccessToken } from "@/lib/session";
import { updateMyProfile } from "@/lib/user";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export const StylesScreen: React.FC = () => {
  const router = useRouter();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const [genresError, setGenresError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadGenres = async () => {
      setLoadingGenres(true);
      setGenresError(null);
      try {
        const data = await getGenres();
        if (active) setGenres(data);
      } catch (err) {
        if (active) setGenresError(formatApiError(err));
      } finally {
        if (active) setLoadingGenres(false);
      }
    };

    loadGenres();
    return () => {
      active = false;
    };
  }, []);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((s) => s !== id) : [...prev, id];

      if (error && next.length > 0) {
        setError(null); // on efface l'erreur dès qu'au moins un style est sélectionné
      }

      return next;
    });
  };

  const handleContinue = async () => {
    if (!selected.length) {
      setError("Sélectionne au moins un style pour continuer.");
      return;
    }

    const payloadGenres = selected
      .map((id) => genres.find((genre) => genre.id === id)?.name)
      .filter(Boolean) as string[];

    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        setError("Tu dois être connecté pour continuer.");
        return;
      }

      await updateMyProfile({ genres: payloadGenres }, token);
      router.push("/(onboarding)/skills");
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout
      imageSource={require("@/assets/images/auth/background-3.png")}
      progress={0.6}
      onBack={() => router.back()}
    >
      <Text style={styles.title}>Tes styles</Text>
      <Text style={styles.subtitle}>Indique tes genres de prédilection.</Text>

      <View style={styles.tagsContainer}>
        {loadingGenres && <Text style={styles.helperText}>Chargement…</Text>}

        {!loadingGenres &&
          genres.map((genre) => (
            <TagChip
              key={genre.id}
              label={genre.name}
              selected={selected.includes(genre.id)}
              onPress={() => toggle(genre.id)}
            />
          ))}

        {error && <Text style={styles.errorText}>{error}</Text>}
        {genresError && <Text style={styles.errorText}>{genresError}</Text>}
      </View>

      <View style={styles.buttonWrapper}>
        <ButtonLoop label="Continuer" onPress={handleContinue} loading={loading} />
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  title: {
    ...Typography.title1Bold,
    color: Palette.bgWhite,
    marginBottom: 6,
  },
  subtitle: {
    ...Typography.bodyRegular,
    color: Palette.bgWhite,
    marginBottom: 24,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  errorText: {
    width: "100%",
    marginTop: 10,
    ...Typography.smallLight,
    color: Palette.primary,
    textAlign: "center",
  },
  helperText: {
    width: "100%",
    ...Typography.smallLight,
    color: Palette.grey100,
    textAlign: "center",
    marginBottom: 8,
  },
  buttonWrapper: {
    marginTop: 8,
  },
});

export default StylesScreen;
