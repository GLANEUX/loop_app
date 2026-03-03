// hooks/use-color-scheme.web.ts
import { useEffect, useState } from "react";

export type ColorSchemeName = "light" | "dark";

/**
 * Version web du hook : utilise matchMedia
 */
export function useColorScheme(): ColorSchemeName {
  const getPreferred = (): ColorSchemeName =>
    globalThis.window.matchMedia &&
    globalThis.window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";

  const [scheme, setScheme] = useState<ColorSchemeName>(getPreferred);

  useEffect(() => {
    const media = globalThis.window.matchMedia("(prefers-color-scheme: dark)");

    const listener = () => {
      setScheme(media.matches ? "dark" : "light");
    };

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  return scheme;
}
