/* --------------------------------------------- */
/*                  RAW TOKENS                   */
/*      (exactement comme ton Figma)             */
/* --------------------------------------------- */

export const Palette = {
  /* Brand */
  primary: "#DD6031",
  primary50: "#F79773",
  primary200: "#C54B1E",

  secondary: "#8C253B",
  secondary50: "#CE3C51",
  secondary200: "#8C253B",

  /* Surface */
  bgBlack: "#010C13",
  bgWhite: "#FFFFFF",
  whiteSpecial: "#FEF5EB",

  /* Greys */
  grey100: "#E9ECEF",
  grey200: "#DCE0E5",
  grey300: "#CED4DA",
  grey700: "#6C757D",
  grey800: "#50585F",
  grey900: "#343A40",
  black: "#000000",

  /* System */
  error: "#EE283B",
  warning: "#FFA808",
  valid: "#26AF5D",

  /* CTA */
  ctaDefault: "#DD6031",
  ctaPressed: "#B54F28",
  ctaDisabled: "#E9ECEF",
};

/* --------------------------------------------- */
/*                  SEMANTIC TOKENS              */
/*  (ce que tes composants vont réellement lire) */
/* --------------------------------------------- */

export const Colors = {
  light: {
    /* Backgrounds */
    background: Palette.bgWhite,
    backgroundAlt: Palette.whiteSpecial,
    surface: Palette.bgWhite,
    surfaceDark: Palette.grey100,

    /* Text */
    textPrimary: Palette.black,
    textInverse: Palette.bgWhite,
    textSecondary: Palette.grey800,
    textTertiary: Palette.grey300,
    textError: Palette.error,

    /* Brand */
    brandPrimary: Palette.primary,
    brandPrimaryPressed: Palette.primary200,
    brandSecondary: Palette.secondary,

    /* Icons */
    iconPrimary: Palette.black,
    iconInverse: Palette.bgWhite,

    /* Borders */
    border: Palette.grey200,
    borderStrong: Palette.grey300,

    /* CTA */
    ctaBg: Palette.primary,
    ctaBgPressed: Palette.ctaPressed,
    ctaBgDisabled: Palette.ctaDisabled,
    ctaText: Palette.bgWhite,

    /* States */
    success: Palette.valid,
    warning: Palette.warning,
    error: Palette.error,

    /* Tabs */
    tabIconDefault: Palette.grey700,
    tabIconSelected: Palette.primary,
  },

  dark: {
    /* Backgrounds */
    background: Palette.bgBlack,
    backgroundAlt: "#0A0F14",
    surface: "#0D141A",
    surfaceDark: "#020A0F",

    /* Text */
    textPrimary: Palette.bgWhite,
    textInverse: Palette.black,
    textSecondary: Palette.grey300,
    textTertiary: Palette.grey700,
    textError: Palette.error,

    /* Brand */
    brandPrimary: Palette.primary50,
    brandPrimaryPressed: Palette.primary,
    brandSecondary: Palette.secondary50,

    /* Icons */
    iconPrimary: Palette.bgWhite,
    iconInverse: Palette.black,

    /* Borders */
    border: "#1E1E1E",
    borderStrong: "#2E2E2E",

    /* CTA */
    ctaBg: Palette.primary50,
    ctaBgPressed: Palette.primary,
    ctaBgDisabled: Palette.grey800,
    ctaText: Palette.bgBlack,

    /* States */
    success: Palette.valid,
    warning: Palette.warning,
    error: Palette.error,

    tabIconDefault: Palette.grey700,
    tabIconSelected: Palette.primary50,
  },
};

export const Fonts = {
  light: "Poppins_300Light",
  regular: "Poppins_400Regular",
  medium: "Poppins_500Medium",
  semibold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold",
};

export const Typography = {
  // ---- DISPLAY / TITLES ----

  largeTitleBold: {
    fontFamily: "Poppins_700Bold",
    fontSize: 34,
    lineHeight: 46,
  },
  largeTitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 34,
    lineHeight: 46,
  },

  title1Bold: {
    fontFamily: "Poppins_700Bold",
    fontSize: 28,
    lineHeight: 38,
  },
  title1: {
    fontFamily: "Poppins_400Regular",
    fontSize: 28,
    lineHeight: 38,
  },

  title2Bold: {
    fontFamily: "Poppins_700Bold",
    fontSize: 22,
    lineHeight: 30,
  },
  title2: {
    fontFamily: "Poppins_400Regular",
    fontSize: 22,
    lineHeight: 30,
  },

  title3Bold: {
    fontFamily: "Poppins_700Bold",
    fontSize: 20,
    lineHeight: 27,
  },
  title3: {
    fontFamily: "Poppins_400Regular",
    fontSize: 20,
    lineHeight: 27,
  },

  // ---- BODY TEXT ----

  bodyBold: {
    fontFamily: "Poppins_700Bold",
    fontSize: 17,
    lineHeight: 23,
  },

  bodyRegular: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    lineHeight: 23,
  },

  bodyMedium: {
    fontFamily: "Poppins_500Medium",
    fontSize: 16,
    lineHeight: 23,
  },

  bodyLight: {
    fontFamily: "Poppins_300Light",
    fontSize: 16,
    lineHeight: 23,
  },

  bodyBoldItalic: {
    fontFamily: "Poppins_700Bold",
    fontSize: 17,
    fontStyle: "italic",
    lineHeight: 23,
  },

  bodyItalic: {
    fontFamily: "Poppins_400Regular",
    fontStyle: "italic",
    fontSize: 17,
    lineHeight: 23,
  },

  // ---- SMALL TEXT ----

  smallSemibold: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    lineHeight: 23,
  },

  smallLight: {
    fontFamily: "Poppins_300Light",
    fontSize: 14,
    lineHeight: 20,
  },
};
