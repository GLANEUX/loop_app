import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BackIcon from "@/assets/icons/icons/arrow-right-outline-white.svg";
import { Palette, Typography } from "@/constants/theme";

export default function NotificationsScreen() {
  const [generalEnabled, setGeneralEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [vibrationEnabled, setVibrationEnabled] = useState(false);
  const [messagesEnabled, setMessagesEnabled] = useState(false);
  const [matchesEnabled, setMatchesEnabled] = useState(false);
  const [challengeEnabled, setChallengeEnabled] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={router.back}>
            <BackIcon
              width={22}
              height={22}
              style={{ transform: [{ scaleX: -1 }] }}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>

        <Text style={styles.sectionTitle}>Général</Text>
        <SettingToggle
          label="Notifications"
          value={generalEnabled}
          onValueChange={setGeneralEnabled}
        />
        <SettingToggle
          label="Son"
          value={soundEnabled}
          onValueChange={setSoundEnabled}
        />
        <SettingToggle
          label="Vibrations"
          value={vibrationEnabled}
          onValueChange={setVibrationEnabled}
        />

        <View style={styles.separator} />

        <Text style={styles.sectionTitle}>Système</Text>
        <SettingToggle
          label="Messages privés"
          value={messagesEnabled}
          onValueChange={setMessagesEnabled}
        />
        <SettingToggle
          label="Matchs"
          value={matchesEnabled}
          onValueChange={setMatchesEnabled}
        />
        <SettingToggle
          label="Challenge Week"
          value={challengeEnabled}
          onValueChange={setChallengeEnabled}
        />

        <View style={styles.separator} />
      </ScrollView>
    </SafeAreaView>
  );
}

type SettingToggleProps = {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

const SettingToggle: React.FC<SettingToggleProps> = ({
  label,
  value,
  onValueChange,
}) => (
  <View style={styles.toggleRow}>
    <Text style={styles.toggleLabel}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: "#3C434A", true: Palette.primary }}
      thumbColor={Palette.grey200}
    />
  </View>
);

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
  header: {
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    left: 0,
    width: 32,
    height: 32,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  headerTitle: {
    ...Typography.title2Bold,
    color: Palette.bgWhite,
  },
  sectionTitle: {
    marginTop: 32,
    ...Typography.title3Bold,
    color: Palette.bgWhite,
  },
  toggleRow: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleLabel: {
    ...Typography.bodyMedium,
    color: Palette.bgWhite,
  },
  separator: {
    marginTop: 28,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
});
