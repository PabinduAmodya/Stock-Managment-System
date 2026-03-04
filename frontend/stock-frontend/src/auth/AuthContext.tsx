import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { AuthUser } from '../types/api';

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  login: (u: AuthUser) => void;
  logout: () => void;
  /** Call this after a profile update so the navbar reflects the new name/email without re-login */
  updateUser: (partial: Partial<Pick<AuthUser, 'name' | 'email'>>) => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

const STORAGE_KEY = 'sm.auth.user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Load persisted session on app start ──────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // ignore malformed data
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Login: save full AuthUser to state + localStorage ─────────────────────
  const login = (u: AuthUser) => {
    setUser(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  };

  // ── Logout: clear state + localStorage ────────────────────────────────────
  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  // ── updateUser: merge partial fields (name/email) without full re-login ───
  // Used by SettingsPage so the sidebar shows the updated name immediately
  const updateUser = (partial: Partial<Pick<AuthUser, 'name' | 'email'>>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const value = useMemo(
    () => ({ user, loading, login, logout, updateUser }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}