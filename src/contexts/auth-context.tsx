import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';

import { api, setAccessToken, type ApiUser } from '@/services/api';

export type UserRole = ApiUser['role'];
export type AppUser = ApiUser;

type AuthContextValue = {
  user: AppUser | null;
  token: string | null;
  signIn: (email: string, password: string) => Promise<AppUser>;
  signUp: (name: string, email: string, password: string) => Promise<AppUser>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    signIn: async (email, password) => {
      const result = await api.signIn(email.trim(), password);
      setAccessToken(result.token);
      setToken(result.token);
      setUser(result.user);
      return result.user;
    },
    signUp: async (name, email, password) => {
      const result = await api.signUp(name.trim(), email.trim(), password);
      setAccessToken(result.token);
      setToken(result.token);
      setUser(result.user);
      return result.user;
    },
    signOut: () => {
      void api.signOut().catch(() => undefined);
      setAccessToken(null);
      setToken(null);
      setUser(null);
    },
  }), [user, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
