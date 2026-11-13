import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';

import demoUsers from '@/data/demo-users.json';

export type UserRole = 'mother' | 'doctor' | 'chw';

export type AppUser = {
  email: string;
  name: string;
  role: UserRole;
};

type AuthContextValue = {
  user: AppUser | null;
  signIn: (email: string, password: string) => AppUser | null;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AppUser | null>(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      signIn: (email, password) => {
        const account = demoUsers.find(
          (entry) =>
            entry.email.toLowerCase() === email.trim().toLowerCase() &&
            entry.password === password,
        );
        if (!account) return null;

        if (account.role !== 'mother' && account.role !== 'doctor' && account.role !== 'chw') return null;
        const signedInUser: AppUser = {
          email: account.email,
          name: account.name,
          role: account.role,
        };
        setUser(signedInUser);
        return signedInUser;
      },
      signOut: () => setUser(null),
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
