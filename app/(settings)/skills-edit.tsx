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
import { getInstruments, Instrument } from "@/lib/catalog";
import { getAccessToken } from "@/lib/session";
import { getMyProfileCached, updateMyProfile } from "@/lib/user";

export default function SkillsEditScreen() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [levelsById, setLevelsById] = useState<Record<string, string>>({});
  const [profileInstruments, setProfileInstruments] = useState<
    Array<{ instrument: string; level: string }>
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingInstruments, setLoadingInstruments] = useState(true);
  const [instrumentsError, setInstrumentsError] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    let active = true;
    const loadInstruments = async () => {
      setLoadingInstruments(true);
      setInstrumentsError(null);
      try {
        const data = await getInstruments();
        if (active) setInstruments(data);
      } catch (err) {
        if (active) setInstrumentsError(formatApiError(err));
      } finally {
        if (active) setLoadingInstruments(false);
      }
    };
    loadInstruments();
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
        if (!active || !me.profile?.instruments?.length) return;
        setProfileInstruments(me.profile.instruments);
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
    if (!instruments.length || !profileInstruments.length || selected.length) {
      return;
    }
    if (hasInteracted) return;
    const nextSelected: string[] = [];
    const nextLevels: Record<string, string> = {};

    for (const item of profileInstruments) {
      const match = instruments.find((inst) => inst.name === item.instrument);
      if (!match) continue;
      nextSelected.push(match.id);
      nextLevels[match.id] = item.level || "Intermediate";
    }

    if (nextSelected.length) {
      setSelected(nextSelected);
      setLevelsById(nextLevels);
    }
  }, [instruments, profileInstruments, selected.length, hasInteracted]);

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

    setLevelsById((prev) => {
      if (prev[id] && selected.includes(id)) {
        const { [id]: _removed, ...rest } = prev;
        return rest;
      }
      if (!prev[id]) {
        return { ...prev, [id]: "Intermediate" };
      }
      return prev;
    });
  };

  const setLevel = (id: string, level: string) => {
    setLevelsById((prev) => ({ ...prev, [id]: level }));
  };

  const handleContinue = async () => {
    if (!selected.length) {
      setError("Sélectionne au moins une compétence pour continuer.");
      return;
    }

    const payloadInstruments = selected
      .map((id) => {
        const instrument = instruments.find((item) => item.id === id);
        if (!instrument) return null;
        return {
          instrument: instrument.name,
          level: levelsById[id] || "Intermediate",
        };
      })
      .filter(Boolean) as Array<{ instrument: string; level: string }>;

    setLoading(true);
    setError(null);
    setSubmitError(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        setSubmitError("Tu dois être connecté pour continuer.");
        return;
      }

      await updateMyProfile({ instruments: payloadInstruments }, token);
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

        <Text style={styles.title}>Tes compétences</Text>
        <Text style={styles.subtitle}>Guitare, batterie, synthé, voix…</Text>

        {submitError && <Text style={styles.submitErrorText}>{submitError}</Text>}

        <View style={styles.tagsContainer}>
          {loadingInstruments && <Text style={styles.helperText}>Chargement…</Text>}

          {!loadingInstruments &&
            instruments.map((instrument) => (
              <TagChip
                key={instrument.id}
                label={instrument.name}
                selected={selected.includes(instrument.id)}
                onPress={() => toggle(instrument.id)}
              />
            ))}

          {error && <Text style={styles.errorText}>{error}</Text>}
          {instrumentsError && (
            <Text style={styles.errorText}>{instrumentsError}</Text>
          )}
        </View>

        {!!selected.length && (
          <View style={styles.levelsContainer}>
            <Text style={styles.levelsTitle}>Niveau par instrument</Text>
            {selected.map((id) => {
              const instrument = instruments.find((item) => item.id === id);
              if (!instrument) return null;
              const current = levelsById[id] || "Intermediate";
              return (
                <View key={id} style={styles.levelRow}>
                  <Text style={styles.levelLabel}>{instrument.name}</Text>
                  <View style={styles.levelOptions}>
                    {["Beginner", "Intermediate", "Advanced", "Professional"].map(
                      (level) => (
                        <TagChip
                          key={level}
                          label={level}
                          selected={current === level}
                          onPress={() => setLevel(id, level)}
                        />
                      ),
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

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
  levelsContainer: {
    marginTop: 28,
    gap: 18,
  },
  levelsTitle: {
    ...Typography.bodyBold,
    color: Palette.bgWhite,
  },
  levelRow: {
    gap: 10,
  },
  levelLabel: {
    ...Typography.bodyMedium,
    color: Palette.grey300,
  },
  levelOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
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
