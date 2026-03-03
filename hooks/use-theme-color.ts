// hooks/use-theme-color.ts
import { Colors } from "@/constants/theme";
import type { ColorSchemeName } from "./use-color-scheme";
import { useColorScheme } from "./use-color-scheme";

type ThemeColorKey = keyof (typeof Colors)["light"];

type ThemeProps = {
  light?: string;
  dark?: string;
};

/**
 * Retourne une couleur du thème en fonction du color scheme.
 * - si props.light / props.dark est fourni → priorité
 * - sinon on lit Colors[scheme][colorName]
 */
export function useThemeColor(
  props: ThemeProps,
  colorName: ThemeColorKey
): string {
  const colorScheme: ColorSchemeName = useColorScheme();
  const themeFromProps = props[colorScheme];

  if (themeFromProps) {
    return themeFromProps;
  }

  return Colors[colorScheme][colorName];
}
