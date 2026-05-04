// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/api';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  full_name?: string;
  avatar?: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (code: string) => Promise<void>;
  signup: (data: { email: string; password: string; first_name: string; last_name?: string; phone?: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => authService.getStoredUser());

  const refreshUser = async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
      localStorage.setItem('rastlinaUser', JSON.stringify(profile));
    } catch {
      // token invalid
      logout();
    }
  };

useEffect(() => {
  const initAuth = async () => {
    if (authService.isLoggedIn()) {
      try {
        await refreshUser(); // ✅ always validate token
      } catch {
        logout(); // ✅ cleanup if invalid
      }
    }
  };

  initAuth();
}, []);

  const login = async (email: string, password: string) => {
    const data = await authService.login({ email, password });
    setUser(data.user);
  };

  const googleLogin = async (code: string) => {
    const data = await authService.googleLogin(code);
    setUser(data.user);
  };

  const signup = async (data: Parameters<typeof authService.signup>[0]) => {
    await authService.signup(data);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, googleLogin, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}