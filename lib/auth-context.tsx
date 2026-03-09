import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, useSegments } from "expo-router";
import { getAccessToken, clearSession, getStoredUser, StoredUser } from "./session";
import { setUnauthorizedHandler } from "./api";

interface AuthContextType {
  user: StoredUser | null;
  loading: boolean;
  signIn: (data: { token: string; user: StoredUser }) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

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
    const inTabsGroup = segments[0] === "(tabs)";
    const inLandingGroup = segments[0] === "(landing)";
    const inMatchGroup = segments[0] === "(match)";
    const inSettingsGroup = segments[0] === "(settings)";
    const inProGroup = segments[0] === "(pro)";
    
    const isInsideProtectedGroup = inTabsGroup || inMatchGroup || inSettingsGroup || inProGroup;

    if (!user && isInsideProtectedGroup) {
      // Pas connecté et tente d'aller dans une zone protégée -> Landing
      router.replace("/discover-musicians");
    } else if (user && (inAuthGroup || inLandingGroup)) {
      // Connecté et tente d'aller sur login/landing -> Dashboard
      router.replace("/explore");
    }
  }, [user, loading, segments]);

  const signIn = async (data: { token: string; user: StoredUser }) => {
    setUser(data.user);
  };

  const signOut = async () => {
    await clearSession();
    setUser(null);
    router.replace("/discover-musicians");
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
