// src/screens/onboarding/SkillsScreen.tsx

import { OnboardingLayout, TagChip } from "@/components/layout";
import { ButtonLoop } from "@/components/ui";
import { Palette, Typography } from "@/constants/theme";
import { formatApiError } from "@/lib/api";
import { getInstruments, Instrument } from "@/lib/catalog";
import { getAccessToken } from "@/lib/session";
import { getMyProfileCached, updateMyProfile } from "@/lib/user";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export const SkillsScreen: React.FC = () => {
  const router = useRouter();
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [levelsById, setLevelsById] = useState<Record<string, string>>({});
  const [profileInstruments, setProfileInstruments] = useState<
    { instrument: string; level: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingInstruments, setLoadingInstruments] = useState(true);
  const [instrumentsError, setInstrumentsError] = useState<string | null>(null);

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
  }, [instruments, profileInstruments, selected.length]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((s) => s !== id) : [...prev, id];

      if (error && next.length > 0) {
        setError(null); // on efface l'erreur dès qu'au moins une compétence est sélectionnée
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
      .filter(Boolean) as { instrument: string; level: string }[];

    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        setError("Tu dois être connecté pour continuer.");
        return;
      }

      await updateMyProfile({ instruments: payloadInstruments }, token);
      router.push("/(onboarding)/avatar");
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout
      imageSource={require("@/assets/images/auth/background-7.png")}
      progress={0.7}
    >
      <Text style={styles.title}>Tes compétences</Text>
      <Text style={styles.subtitle}>Guitare, batterie, synthé, voix…</Text>

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
        {instrumentsError && <Text style={styles.errorText}>{instrumentsError}</Text>}
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
                  {[
                    "Beginner",
                    "Intermediate",
                    "Advanced",
                    "Professional",
                  ].map((level) => (
                    <TagChip
                      key={level}
                      label={level}
                      selected={current === level}
                      onPress={() => setLevel(id, level)}
                    />
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      )}

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
  levelsContainer: {
    marginBottom: 20,
  },
  levelsTitle: {
    ...Typography.bodyBold,
    color: Palette.bgWhite,
    marginBottom: 10,
  },
  levelRow: {
    marginBottom: 12,
  },
  levelLabel: {
    ...Typography.bodyRegular,
    color: Palette.bgWhite,
    marginBottom: 8,
  },
  levelOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  buttonWrapper: {
    marginTop: 8,
  },
});

export default SkillsScreen;
