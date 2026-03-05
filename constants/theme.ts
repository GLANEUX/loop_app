/* --------------------------------------------- */
/*                  RAW TOKENS                   */
/*      (exactement comme ton Figma)             */
/* --------------------------------------------- */

export const Palette = {
  /* Brand */
  primary: "#DD6031", // Orange
  primary50: "#E6825C", // Orange éclairci (tint)
  primary200: "#B54F28", // Orange foncé

  secondary: "#8C253B", // Rouge bordeaux
  secondary50: "#A83F56", // Bordeaux éclairci (tint)
  secondary200: "#6B1D2D", // Bordeaux foncé

  /* Surface */
  bgBlack: "#010C13", // Noir Background officiel
  bgWhite: "#FFFFFF",
  whiteSpecial: "#FEF5EB", // Beige officiel

  /* Greys */
  grey100: "#E9ECEF",
  grey200: "#DCE0E5",
  grey300: "#CED4DA",
  grey600: "#9AA7B5",
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

  /* Others */
  opacityBackground: "rgba(0,0,0,0.45)",
  opacityBackgroundLight: "rgba(255,255,255,0.1)",
  
  /* Official Gradient */
  gradient: ["#8C253B", "#DD6031"],
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
    brandPrimary: Palette.primary,
    brandPrimaryPressed: Palette.primary200,
    brandSecondary: Palette.secondary,

    /* Icons */
    iconPrimary: Palette.bgWhite,
    iconInverse: Palette.black,

    /* Borders */
    border: "#1E1E1E",
    borderStrong: "#2E2E2E",

    /* CTA */
    ctaBg: Palette.primary,
    ctaBgPressed: Palette.ctaPressed,
    ctaBgDisabled: Palette.grey800,
    ctaText: Palette.bgWhite,

    /* States */
    success: Palette.valid,
    warning: Palette.warning,
    error: Palette.error,

    tabIconDefault: Palette.grey700,
    tabIconSelected: Palette.primary,
  },
};

/* --------------------------------------------- */
/*                     FONTS                     */
/*   (clé = noms utilisés dans useFonts())       */
/* --------------------------------------------- */

export const Fonts = {
  thin: "Poppins_Thin",
  thinItalic: "Poppins_ThinItalic",

  extraLight: "Poppins_ExtraLight",
  extraLightItalic: "Poppins_ExtraLightItalic",

  light: "Poppins_Light",
  lightItalic: "Poppins_LightItalic",

  regular: "Poppins_Regular",
  italic: "Poppins_Italic",

  medium: "Poppins_Medium",
  mediumItalic: "Poppins_MediumItalic",

  semibold: "Poppins_SemiBold",
  semiboldItalic: "Poppins_SemiBoldItalic",

  bold: "Poppins_Bold",
  boldItalic: "Poppins_BoldItalic",

  extraBold: "Poppins_ExtraBold",
  extraBoldItalic: "Poppins_ExtraBoldItalic",

  black: "Poppins_Black",
  blackItalic: "Poppins_BlackItalic",
};

/* --------------------------------------------- */
/*                  TYPOGRAPHY                   */
/* --------------------------------------------- */

export const Typography = {
  // ---- DISPLAY / TITLES ----

  largeTitleBold: {
    fontFamily: Fonts.bold,
    fontSize: 34,
    lineHeight: 46,
  },
  largeTitle: {
    fontFamily: Fonts.regular,
    fontSize: 34,
    lineHeight: 46,
  },

  title1Bold: {
    fontFamily: Fonts.bold,
    fontSize: 28,
    lineHeight: 38,
  },
  title1: {
    fontFamily: Fonts.semibold,
    fontSize: 28,
    lineHeight: 38,
  },

  title2Bold: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    lineHeight: 30,
  },
  title2: {
    fontFamily: Fonts.regular,
    fontSize: 22,
    lineHeight: 30,
  },

  title3Bold: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    lineHeight: 27,
  },
  title3: {
    fontFamily: Fonts.regular,
    fontSize: 20,
    lineHeight: 27,
  },

  // ---- BODY TEXT ----

  bodyBold: {
    fontFamily: Fonts.bold,
    fontSize: 17,
    lineHeight: 23,
  },

  bodyRegular: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    lineHeight: 23,
  },

  bodyMedium: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    lineHeight: 23,
  },

  bodyLight: {
    fontFamily: Fonts.light,
    fontSize: 16,
    lineHeight: 23,
  },

  bodyBoldItalic: {
    fontFamily: Fonts.boldItalic,
    fontSize: 17,
    lineHeight: 23,
  },

  bodyItalic: {
    fontFamily: Fonts.italic,
    fontSize: 17,
    lineHeight: 23,
  },

  // ---- SMALL TEXT ----

  smallSemibold: {
    fontFamily: Fonts.semibold,
    fontSize: 14,
    lineHeight: 23,
  },

  smallLight: {
    fontFamily: Fonts.light,
    fontSize: 14,
    lineHeight: 20,
  },
};
