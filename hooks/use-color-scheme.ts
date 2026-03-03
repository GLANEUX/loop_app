// hooks/use-color-scheme.ts
import { useColorScheme as useRNColorScheme } from "react-native";

export type ColorSchemeName = "light" | "dark";

/**
 * Hook thème LOOP
 * - Ne retourne JAMAIS null
 * - Toujours 'light' ou 'dark'
 */
export function useColorScheme(): ColorSchemeName {
  const systemScheme = useRNColorScheme();

  // On force 'light' par défaut si c'est null / undefined / autre
  return systemScheme === "dark" ? "dark" : "light";
}
