'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type User = { id: number; nom: string; prenom: string; role: string; siteId?: number; date_naissance?: string };
type AuthContextType = { 
  user: User | null; 
  isReady: boolean;
  login: (token: string, userData: User) => void; 
  logout: () => void;
  register: (userData: Record<string, unknown>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // On enferme la logique dans une fonction pour satisfaire le linter
    const chargerUtilisateur = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setIsReady(true);
    };

    chargerUtilisateur();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    if (userData.role === 'ADMIN') {
      router.push('/admin');
    } else if (userData.role === 'DIRECTEUR') {
      router.push('/directeur');
    } else {
      router.push('/dashboard');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  const register = async (userData: Record<string, unknown>) => {
    const res = await fetch('http://localhost:3000/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || "Erreur lors de l'inscription");
    }
    
    // Redirection vers la page de connexion après inscription
    router.push('/');
  };

  return <AuthContext.Provider value={{ user, isReady, login, logout, register }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return context;
};
