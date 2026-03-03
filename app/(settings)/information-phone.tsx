import { router } from "expo-router";
import React, { useCallback, useEffect, useState, useMemo, useRef } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import BackIcon from "@/assets/icons/icons/direction-left-2-outline-white.svg";
import { ButtonLoop } from "@/components/ui";
import { Palette, Typography } from "@/constants/theme";
import { formatApiError } from "@/lib/api";
import { getAccessToken } from "@/lib/session";
import { getMyProfileCached, updateMyProfile } from "@/lib/user";

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

export default function InformationPhoneScreen() {
  const insets = useSafeAreaInsets();
  const inputRef = useRef<RNTextInput>(null);
  
  const [phone, setPhone] = useState("");
  const [initialPhone, setInitialPhone] = useState("");
  const [country, setCountry] = useState<Country>(COUNTRIES[0]);
  const [initialCountryCode, setInitialCountryCode] = useState("FR");
  
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const token = await getAccessToken();
        if (!token) return;
        const me = await getMyProfileCached(token);
        if (active && me.profile?.phoneNumber) {
          const rawPhone = me.profile.phoneNumber;
          const matchedCountry = COUNTRIES.find(c => rawPhone.startsWith(c.prefix)) || COUNTRIES[0];
          const digits = rawPhone.replace(matchedCountry.prefix, "").replaceAll(/\D/g, "");
          
          setPhone(digits);
          setInitialPhone(digits);
          setCountry(matchedCountry);
          setInitialCountryCode(matchedCountry.code);
        }
      } catch {
        // ignore prefill error
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const isChanged = useMemo(() => {
    return phone !== initialPhone || country.code !== initialCountryCode;
  }, [phone, initialPhone, country.code, initialCountryCode]);

  const validatePhone = (digits: string) => {
    return digits.length >= 9 && digits.length <= 10;
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    const digits = phone.replaceAll(/\D/g, "");
    
    if (!digits) {
      setError("Veuillez renseigner votre numéro.");
      return;
    }
    
    if (!validatePhone(digits)) {
      setError("Le numéro doit contenir entre 9 et 10 chiffres.");
      return;
    }

    const internationalNumber = `${country.prefix}${digits}`;

    setLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        setError("Tu dois être connecté pour continuer.");
        setLoading(false);
        return;
      }
      
      await updateMyProfile({ phoneNumber: internationalNumber }, token);
      
      setSuccess("Numéro de téléphone mis à jour.");
      setInitialPhone(digits); // Update initial state to disable button again
      setInitialCountryCode(country.code);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const openCountryModal = () => setCountryModalVisible(true);
  const closeCountryModal = () => setCountryModalVisible(false);

  const handleSelectCountry = (c: Country) => {
    setCountry(c);
    closeCountryModal();
    if (error) setError(null);
  };

  const handleChangePhone = (value: string) => {
    const digitsOnly = value.replaceAll(/\D/g, "").slice(0, 10);
    setPhone(digitsOnly);
    if (error) setError(null);
  };

  const digits = phone.padEnd(10, " ").split("");

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 8 : 0}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={router.back}>
              <BackIcon
                width={24}
                height={24}
                style={{ transform: [{ scaleX: -1 }] }}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Modifier le téléphone</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.description}>
              Votre numéro de téléphone nous permet de sécuriser votre compte et de vous aider à vous connecter.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.inputLabel}>Pays de résidence</Text>
            <TouchableOpacity style={styles.countrySelector} onPress={openCountryModal}>
              <View style={styles.countryInfo}>
                <Text style={styles.flag}>{country.flag}</Text>
                <Text style={styles.countryName}>{country.label}</Text>
              </View>
              <Text style={styles.prefixText}>{country.prefix}</Text>
            </TouchableOpacity>

            <View style={styles.phoneInputSection}>
              <Text style={styles.inputLabel}>Numéro de téléphone</Text>
              
              <View style={styles.digitInputContainer}>
                <RNTextInput
                  ref={inputRef}
                  value={phone}
                  onChangeText={handleChangePhone}
                  keyboardType="phone-pad"
                  maxLength={10}
                  style={styles.hiddenInput}
                  autoFocus
                />
                
                <TouchableOpacity 
                  activeOpacity={1} 
                  style={styles.digitRow}
                  onPress={() => inputRef.current?.focus()}
                >
                  <View style={styles.casesContainer}>
                    {digits.map((digit, index) => {
                      const hasDigit = digit.trim().length > 0;
                      return (
                        <View 
                          key={index} 
                          style={[
                            styles.digitCase,
                            hasDigit && styles.digitCaseFilled,
                            index === 2 || index === 4 || index === 6 || index === 8 ? styles.digitCaseMargin : null
                          ]}
                        >
                          <Text style={styles.digitText}>{hasDigit ? digit : ""}</Text>
                        </View>
                      );
                    })}
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {!!error && (
            <View style={styles.feedbackContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          {!!success && (
            <View style={styles.feedbackContainer}>
              <Text style={styles.successText}>{success}</Text>
            </View>
          )}

          <ButtonLoop
            label="Enregistrer le numéro"
            onPress={handleSave}
            loading={loading}
            style={styles.saveButton}
            disabled={!isChanged || loading || !!success}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={countryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeCountryModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Choisir un pays</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
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
                  {c.code === country.code && (
                    <View style={styles.selectedDot} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.closeModalButton} onPress={closeCountryModal}>
              <Text style={styles.closeModalText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.bgBlack,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  backButton: {
    position: "absolute",
    left: 0,
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
  infoSection: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  description: {
    ...Typography.bodyRegular,
    color: Palette.grey300,
    lineHeight: 22,
    fontSize: 15,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    padding: 20,
    gap: 24,
  },
  inputLabel: {
    ...Typography.smallSemibold,
    color: Palette.grey300,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  countrySelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  countryInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  flag: {
    fontSize: 24,
  },
  countryName: {
    ...Typography.bodyMedium,
    color: Palette.bgWhite,
  },
  prefixText: {
    ...Typography.bodyBold,
    color: Palette.primary50,
  },
  phoneInputSection: {
    marginTop: 4,
  },
  digitInputContainer: {
    position: "relative",
  },
  hiddenInput: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    zIndex: 1,
  },
  digitRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  casesContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  digitCase: {
    width: 28,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
    borderBottomWidth: 2,
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  digitCaseFilled: {
    borderBottomColor: Palette.primary,
  },
  digitCaseMargin: {
    marginLeft: 4,
  },
  digitText: {
    ...Typography.bodyBold,
    color: Palette.bgWhite,
    fontSize: 18,
  },
  feedbackContainer: {
    marginTop: 16,
    paddingHorizontal: 4,
  },
  errorText: {
    ...Typography.bodyMedium,
    color: Palette.error,
    fontSize: 14,
  },
  successText: {
    ...Typography.bodyMedium,
    color: Palette.valid,
    fontSize: 14,
  },
  saveButton: {
    marginTop: 32,
    width: "100%",
    borderRadius: 16,
  },

  /* --- Modal --- */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#0B0F14",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: "80%",
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    marginBottom: 16,
  },
  modalTitle: {
    ...Typography.title3Bold,
    color: Palette.bgWhite,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
    gap: 12,
  },
  countryItemActive: {
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  countryItemFlag: {
    fontSize: 24,
  },
  countryItemLabel: {
    ...Typography.bodyMedium,
    color: Palette.bgWhite,
  },
  countryItemPrefix: {
    ...Typography.smallLight,
    color: Palette.grey300,
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.primary,
  },
  closeModalButton: {
    marginTop: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  closeModalText: {
    ...Typography.bodyBold,
    color: Palette.grey300,
  },
});
