import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, useSegments } from "expo-router";
import { getAccessToken, clearSession, getStoredUser, StoredUser } from "./session";
import { setUnauthorizedHandler } from "./api";
import { getNextOnboardingRoute, getOnboardingEntry } from "./onboarding";
import { getMyProfileDetails, UserProfile } from "./user";

interface AuthContextType {
  user: StoredUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (data: { token: string; user: StoredUser }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  const refreshProfile = async () => {
    try {
      const token = await getAccessToken();
      if (token) {
        const fullProfile = await getMyProfileDetails(token);
        setProfile(fullProfile);
      }
    } catch (e) {
      console.error("Failed to refresh profile", e);
    }
  };

  useEffect(() => {
    // Configurer la déconnexion automatique en cas de 401
    setUnauthorizedHandler(() => {
      signOut();
    });

    const initAuth = async () => {
      try {
        const [token, storedUser] = await Promise.all([
          getAccessToken(),
          getStoredUser()
        ]);

        if (token && storedUser) {
          setUser(storedUser);
          // Charger le profil complet en arrière-plan
          const fullProfile = await getMyProfileDetails(token);
          setProfile(fullProfile);
        }
      } catch (e) {
        console.error("Auth init failed", e);
      } finally {
        setLoading(false);
      }
    };
    initAuth();

    return () => {
      setUnauthorizedHandler(null);
    };
  }, []);

  // Protection de route : redirection basée sur l'état d'auth et les segments actuels
  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboardingGroup = segments[1] === "(onboarding)";
    const inTabsGroup = segments[0] === "(tabs)";
    const inLandingGroup = segments[0] === "(landing)";
    const inMatchGroup = segments[0] === "(match)";
    const inSettingsGroup = segments[0] === "(settings)";
    const inProGroup = segments[0] === "(pro)";
    
    const isInsideProtectedGroup = inTabsGroup || inMatchGroup || inSettingsGroup || inProGroup || inOnboardingGroup;

    if (!user && isInsideProtectedGroup) {
      // Pas connecté et tente d'aller dans une zone protégée -> Landing
      router.replace("/discover-musicians");
    } else if (user && ((inAuthGroup && !inOnboardingGroup) || inLandingGroup)) {
      // Connecté et tente d'aller sur login/landing (mais pas onboarding)
      // Vérifier si l'onboarding est terminé
      const entry = getOnboardingEntry(profile);
      if (entry) {
        // Si on vient de s'inscrire, on tente d'aller directement à l'étape
        if (segments[1] === "(signup)") {
          const nextRoute = getNextOnboardingRoute(profile);
          if (nextRoute) {
            router.replace(nextRoute as any);
            return;
          }
        }
        router.replace(entry as any);
      } else {
        router.replace("/explore");
      }
    }
  }, [user, profile, loading, segments]);

  const signIn = async (data: { token: string; user: StoredUser }) => {
    // Charger le profil AVANT de mettre à jour l'utilisateur pour éviter une redirection prématurée
    // vers un onboarding incomplet si le profil n'est pas encore là.
    try {
      const fullProfile = await getMyProfileDetails(data.token);
      setProfile(fullProfile);
      setUser(data.user);
    } catch (e) {
      console.error("Failed to fetch profile after sign in", e);
      // En cas d'erreur, on met quand même l'utilisateur pour ne pas bloquer l'auth
      setUser(data.user);
    }
  };

  const signOut = async () => {
    await clearSession();
    setUser(null);
    setProfile(null);
    router.replace("/discover-musicians");
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
