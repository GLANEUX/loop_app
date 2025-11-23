/**
 * env.ts
 * Helper sécurisé pour lire les variables EXPO_PUBLIC_*
 */

/**
 * Fonction utilitaire qui garantit :
 * - la variable existe
 * - elle est typée string
 * - sinon elle log un warning et renvoie ""
 */
function getEnvVar(key: string): string {
  const value = process.env[key];

  if (value === undefined || value === null) {
    console.warn(`[env] La variable ${key} est manquante.`);
    return "";
  }

  return value;
}

/**
 * Toutes les variables EXPO_PUBLIC_ utilisées dans l'app.
 */
export const Env = {
  STORYBOOK_ENABLED: getEnvVar("EXPO_PUBLIC_STORYBOOK_ENABLED") === "true",
  API_URL: getEnvVar("EXPO_PUBLIC_API_URL"),
  ENV: getEnvVar("EXPO_PUBLIC_ENV"),
  // Ajoute ce que tu veux :
  // SENTRY_DSN: getEnvVar("EXPO_PUBLIC_SENTRY_DSN"),
  // FIREBASE_API_KEY: getEnvVar("EXPO_PUBLIC_FIREBASE_API_KEY"),
};
