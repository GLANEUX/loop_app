// src/screens/onboarding/PhoneStepScreen.tsx
import { OnboardingLayout } from "@/components/layout";
import { ButtonLoop } from "@/components/ui";
import { Palette, Typography } from "@/constants/theme";
import { formatApiError } from "@/lib/api";
import { getAccessToken } from "@/lib/session";
import { getMyProfileCached, updateMyProfile } from "@/lib/user";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Country = {
  code: string;
  label: string;
  prefix: string;
  flag: string;
};

const COUNTRIES: Country[] = [
  { code: "FR", label: "France", prefix: "+33", flag: "🇫🇷" },
  { code: "BE", label: "Belgique", prefix: "+32", flag: "🇧🇪" },
  { code: "CH", label: "Suisse", prefix: "+41", flag: "🇨🇭" },
];

export const PhoneStepScreen: React.FC = () => {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState<Country>(COUNTRIES[0]);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      const token = await getAccessToken();
      if (!token) return;
      try {
        const me = await getMyProfileCached(token);
        const phoneNumber = me.profile?.phoneNumber;
        if (!active || !phoneNumber) return;

        setPhone((prev) => {
          if (prev) return prev;
          const matchedCountry =
            COUNTRIES.find((c) => phoneNumber.startsWith(c.prefix)) || COUNTRIES[0];
          const digits = phoneNumber
            .replace(matchedCountry.prefix, "")
            .replaceAll(/\D/g, "")
            .slice(0, 10);
          setCountry(matchedCountry);
          return digits;
        });
      } catch {
        // ignore prefill errors
      }
    };
    loadProfile();
    return () => {
      active = false;
    };
  }, []);

  const openCountryModal = () => setCountryModalVisible(true);
  const closeCountryModal = () => setCountryModalVisible(false);

  const handleSelectCountry = (c: Country) => {
    setCountry(c);
    closeCountryModal();
  };

  const handleChangePhone = (value: string) => {
    const digitsOnly = value.replaceAll(/\D/g, "");
    const limited = digitsOnly.slice(0, 10);
    setPhone(limited);

    if (error) setError(null);
  };

  const handleContinue = async () => {
    const digits = phone.replaceAll(/\D/g, "");

    if (digits.length < 9 || digits.length > 10) {
      setError("Le numéro doit contenir entre 9 et 10 chiffres.");
      return;
    }

    const internationalNumber = `${country.prefix}${digits}`;

    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        setError("Tu dois être connecté pour continuer.");
        return;
      }

      await updateMyProfile({ phoneNumber: internationalNumber }, token);
      router.push("/birthdate");
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const hasError = Boolean(error);

  return (
    <OnboardingLayout
      imageSource={require("@/assets/images/auth/background-5.png")}
      progress={0.2}
    >
      <Text style={styles.title}>Complète ton profil</Text>
      <Text style={styles.subtitle}>
        Choisis ton pays de résidence et entre ton numéro de téléphone.
      </Text>

      {/* ---- Sélecteur de pays ---- */}
      <TouchableOpacity style={styles.countryRow} onPress={openCountryModal}>
        <Text style={styles.flag}>{country.flag}</Text>
        <Text style={styles.countryText}>{country.label}</Text>
      </TouchableOpacity>

      <View style={styles.separator} />

      {/* ---- Téléphone ---- */}
      <View style={styles.phoneWrapper}>
        <View style={styles.phoneRow}>
          <Text style={[styles.prefix, hasError && styles.prefixError]}>
            {country.prefix}
          </Text>
          <View style={styles.prefixSeparator} />
          <TextInput
            style={[styles.phoneInput, hasError && styles.phoneInputError]}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={handleChangePhone}
            placeholder="0 00 00 00 00"
            placeholderTextColor={Palette.grey300}
          />
        </View>

        {/* underline comme pour le pseudo */}
        <View
          style={[
            styles.phoneUnderline,
            hasError && styles.phoneUnderlineError,
          ]}
        />

        {hasError && <Text style={styles.errorText}>{error}</Text>}
      </View>

      <View style={styles.buttonWrapper}>
        <ButtonLoop label="Continuer" onPress={handleContinue} loading={loading} />
      </View>

      {/* ---- Modal liste des pays ---- */}
      <Modal
        visible={countryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeCountryModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Choisis ton pays</Text>

            <ScrollView
              style={{ maxHeight: 360 }}
              showsVerticalScrollIndicator={false}
            >
              {COUNTRIES.map((c) => (
                <TouchableOpacity
                  key={c.code}
                  style={[
                    styles.countryItem,
                    c.code === country.code && styles.countryItemActive,
                  ]}
                  onPress={() => handleSelectCountry(c)}
                >
                  <Text style={styles.countryItemFlag}>{c.flag}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.countryItemLabel}>{c.label}</Text>
                    <Text style={styles.countryItemPrefix}>{c.prefix}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={{ marginTop: 16 }}>
              <ButtonLoop
                label="Fermer"
                variant="outline"
                disabled={phone.length < 5}
                onPress={closeCountryModal}
              />
            </View>
          </View>
        </View>
      </Modal>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  title: {
    ...Typography.title1Bold,
    color: Palette.bgWhite,
    marginBottom: 12,
  },
  subtitle: {
    ...Typography.bodyRegular,
    color: Palette.bgWhite,
    marginBottom: 32,
  },

  countryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    backgroundColor: Palette.opacityBackgroundLight,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignSelf: "flex-start",
  },

  flag: {
    fontSize: 26,
    marginRight: 10,
  },
  countryText: {
    ...Typography.title3Bold,
    color: Palette.bgWhite,
  },

  separator: {
    height: 2,
    backgroundColor: Palette.grey100,
    marginBottom: 22,
  },

  phoneWrapper: {
    marginBottom: 24,
  },

  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  prefix: {
    ...Typography.title3Bold,
    color: Palette.bgWhite,
  },
  prefixError: {
    color: Palette.primary,
  },
  prefixSeparator: {
    width: 1,
    height: 26,
    backgroundColor: "rgba(255,255,255,0.5)",
    marginHorizontal: 10,
  },
  phoneInput: {
    flex: 1,
    ...Typography.title3Bold,
    color: Palette.bgWhite,
    paddingVertical: 0,
    lineHeight: 40,
  },
  phoneInputError: {
    color: Palette.primary,
  },
  phoneUnderline: {
    height: 2,
    backgroundColor: Palette.grey100,
    marginTop: 4,
  },
  phoneUnderlineError: {
    backgroundColor: Palette.primary,
  },

  errorText: {
    marginTop: 6,
    ...Typography.smallLight,
    color: Palette.primary,
  },

  buttonWrapper: {
    marginTop: 8,
  },

  /* --- Modal pays --- */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#111827",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalTitle: {
    ...Typography.title3Bold,
    color: Palette.bgWhite,
    marginBottom: 12,
    textAlign: "center",
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  countryItemActive: {
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  countryItemFlag: {
    fontSize: 22,
    marginRight: 10,
  },
  countryItemLabel: {
    ...Typography.bodyMedium,
    color: Palette.bgWhite,
  },
  countryItemPrefix: {
    ...Typography.smallLight,
    color: Palette.grey300,
  },
});

export default PhoneStepScreen;
