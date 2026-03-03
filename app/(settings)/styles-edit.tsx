import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BackIcon from "@/assets/icons/icons/arrow-right-outline-white.svg";
import { Palette, Typography } from "@/constants/theme";
import { formatApiError } from "@/lib/api";
import { getGenres, Genre } from "@/lib/catalog";
import { getAccessToken } from "@/lib/session";
import { getMyProfileCached, updateMyProfile } from "@/lib/user";

export default function StylesEditScreen() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [profileGenres, setProfileGenres] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const [genresError, setGenresError] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

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

  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      const token = await getAccessToken();
      if (!token) return;
      try {
        const me = await getMyProfileCached(token);
        if (!active || !me.profile?.genres?.length) return;
        setProfileGenres(me.profile.genres);
      } catch {
        // ignore prefill errors
      }
    };
    loadProfile();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!genres.length || !profileGenres.length || selected.length) return;
    if (hasInteracted) return;
    const matchedIds = genres
      .filter((genre) => profileGenres.includes(genre.name))
      .map((genre) => genre.id);
    if (matchedIds.length) {
      setSelected(matchedIds);
    }
  }, [genres, profileGenres, selected.length, hasInteracted]);

  const toggle = (id: string) => {
    if (!hasInteracted) setHasInteracted(true);
    setSelected((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((s) => s !== id) : [...prev, id];
      if (error && next.length > 0) {
        setError(null);
      }
      if (submitError && next.length > 0) {
        setSubmitError(null);
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
    setSubmitError(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        setSubmitError("Tu dois être connecté pour continuer.");
        return;
      }

      await updateMyProfile({ genres: payloadGenres }, token);
      router.back();
    } catch (err) {
      setSubmitError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.backButton} onPress={router.back}>
          <BackIcon
            width={22}
            height={22}
            style={{ transform: [{ scaleX: -1 }] }}
          />
        </TouchableOpacity>

        <Text style={styles.title}>Styles</Text>
        <Text style={styles.subtitle}>Indiquez vos genres de prédilection</Text>

        {submitError && <Text style={styles.submitErrorText}>{submitError}</Text>}

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

        <TouchableOpacity
          style={[styles.continueButton, loading && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.continueText}>
            {loading ? "Enregistrement..." : "Continuer"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

type TagChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

const TagChip: React.FC<TagChipProps> = ({
  label,
  selected = false,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
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
  backButton: {
    marginTop: 8,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  title: {
    marginTop: 28,
    ...Typography.title1Bold,
    color: Palette.bgWhite,
  },
  subtitle: {
    marginTop: 8,
    ...Typography.bodyRegular,
    color: Palette.bgWhite,
  },
  tagsContainer: {
    marginTop: 28,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  helperText: {
    width: "100%",
    ...Typography.smallLight,
    color: Palette.grey100,
  },
  errorText: {
    width: "100%",
    marginTop: 6,
    ...Typography.smallLight,
    color: Palette.primary,
  },
  submitErrorText: {
    marginTop: 10,
    ...Typography.smallLight,
    color: Palette.primary,
  },
  chip: {
    borderWidth: 2,
    borderColor: Palette.bgWhite,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  chipSelected: {
    borderColor: Palette.primary,
  },
  chipText: {
    ...Typography.bodyBold,
    color: Palette.bgWhite,
  },
  chipTextSelected: {
    color: Palette.primary,
  },
  continueButton: {
    marginTop: 48,
    alignSelf: "center",
    width: "100%",
    backgroundColor: Palette.grey100,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueText: {
    ...Typography.bodyBold,
    color: Palette.grey700,
  },
});
