import RightChevronIcon from "@/assets/icons/icons/direction-right-2-outline-white.svg";
import EditAvatarIcon from "@/assets/icons/icons/edit-outline-white.svg";
import SettingsIcon from "@/assets/icons/icons/settings-outline-white.svg";
import { Palette, Typography } from "@/constants/theme";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const instruments = ["Guitare", "Piano", "Voix"];
const stylesMusicaux = ["Jazz", "Soul"];

export const ProfileScreen: React.FC = () => {
  const username = "Léa Martin";
  const handle = "@leamartin89";
  const location = "Paris";

  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const handleOnClic = () => {
    router.replace("/(settings)/settings");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER : avatar centré + settings en haut à droite */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={handleOnClic}
          >
            <SettingsIcon width={22} height={22} />
          </TouchableOpacity>

          <View style={styles.avatarWrapper}>
            <Image
              source={require("@/assets/images/landing/landing-9.jpg")}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editAvatarButton}>
              <EditAvatarIcon width={25} height={25} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Nom + handle */}
        <View style={styles.identityBlock}>
          <Text style={styles.name}>{username}</Text>
          <Text style={styles.handle}>{handle}</Text>
        </View>

        {/* Localisation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Localisation</Text>
          <Text style={styles.sectionValue}>{location}</Text>
        </View>

        {/* À propos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>
          <Text
            style={styles.about}
            numberOfLines={isAboutExpanded ? undefined : 4}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna...Lorem ipsum
            dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna...Lorem ipsum dolor sit amet,
            consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
            labore et dolore magna...
          </Text>
          <TouchableOpacity onPress={() => setIsAboutExpanded((prev) => !prev)}>
            <Text style={styles.readMore}>
              {isAboutExpanded ? "Lire moins" : "Lire plus"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Instruments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instruments</Text>
          <View style={styles.chipsRow}>
            {instruments.map((label) => (
              <Chip key={label} label={label} />
            ))}
          </View>
        </View>

        {/* Styles musicaux */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Styles musicaux</Text>
          <View style={styles.chipsRow}>
            {stylesMusicaux.map((label) => (
              <Chip key={label} label={label} />
            ))}
          </View>
        </View>

        {/* Projets en ligne */}
        {/* Projets en ligne */}
        <View style={[styles.section, { marginBottom: 120 }]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Projets en ligne</Text>
            <TouchableOpacity>
              <RightChevronIcon width={25} height={25} />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.projectsRow}
          >
            <View style={styles.projectCard} />
            <View style={styles.projectCard} />
            <View style={styles.projectCard} />
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

type ChipProps = {
  label: string;
};

const Chip: React.FC<ChipProps> = ({ label }) => (
  <View style={styles.chip}>
    <Text style={styles.chipText}>{label}</Text>
  </View>
);

// ... tes styles restent identiques

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.bgBlack,
  },
  container: {
    flex: 1,
    marginTop: 15,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },

  /* HEADER */
  header: {
    marginTop: 16,
    alignItems: "center",
    position: "relative",
  },
  settingsButton: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 40,
    height: 50,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarWrapper: {
    marginTop: 10,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 24,
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 35,
    height: 35,
    borderRadius: 26,
    backgroundColor: Palette.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Identité */
  identityBlock: {
    marginTop: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    ...Typography.title2Bold,
    color: Palette.bgWhite,
    textAlign: "left",
  },
  handle: {
    marginTop: 4,
    ...Typography.bodyMedium,
    color: Palette.grey600,
    textAlign: "left",
  },

  /* Sections */
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    ...Typography.title3Bold,
    color: Palette.bgWhite,
    marginBottom: 8,
  },
  sectionValue: {
    ...Typography.bodyMedium,
    color: Palette.bgWhite,
  },
  about: {
    ...Typography.bodyMedium,
    color: Palette.bgWhite,
    lineHeight: 22,
  },
  readMore: {
    marginTop: 8,
    ...Typography.bodyBold,
    color: Palette.bgWhite,
  },

  /* Chips */
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  chip: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: Palette.bgWhite,
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: {
    ...Typography.bodyMedium,
    color: Palette.bgBlack,
  },

  /* Projets */
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chevron: {
    fontSize: 24,
    color: Palette.bgWhite,
  },
  projectsRow: {
    marginTop: 16,
    paddingRight: 24,
    gap: 16,
  },
  projectCard: {
    width: 180,
    height: 220,
    borderRadius: 24,
    backgroundColor: Palette.grey800,
  },
});

export default ProfileScreen;
