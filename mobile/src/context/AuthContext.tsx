import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { clearToken, clearUser, getToken, getUser, saveToken, saveUser } from '../services/auth';

export type AuthUser = {
  id: number;
  nom: string;
  prenom: string;
  role: string;
  siteId: number | null;
};

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (token: string, user: AuthUser) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = await getToken();
        const storedUser = await getUser<AuthUser>();
        setToken(storedToken);
        setUser(storedUser);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isLoading,
      signIn: async (nextToken, nextUser) => {
        await saveToken(nextToken);
        await saveUser(nextUser);
        setToken(nextToken);
        setUser(nextUser);
      },
      signOut: async () => {
        await clearToken();
        await clearUser();
        setToken(null);
        setUser(null);
      },
    }),
    [token, user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return value;
}