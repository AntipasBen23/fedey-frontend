"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  plan: "free" | "pro";
  jobDescription?: string;
  platformContext?: string;
  lastOnboardingStep?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  isLoggedIn: boolean;
  ready: boolean;
  login: (user: AuthUser) => void;
  logout: (deleted?: boolean) => void;
  refreshSession: () => Promise<boolean>;
  updateUser: (patch: Partial<AuthUser>) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  ready: false,
  login: () => {},
  logout: () => {},
  refreshSession: async () => false,
  updateUser: () => {},
});

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://fedey-backend-production.up.railway.app";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  // login — called after any successful auth response; tokens are already in httpOnly cookies.
  const login = useCallback((newUser: AuthUser) => {
    setUser(newUser);
  }, []);

  // updateUser — optimistically patch the in-memory user (e.g. after PATCH /v1/user/onboarding)
  const updateUser = useCallback((patch: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const logout = useCallback((deleted = false) => {
    // Tell the backend to clear the refresh token + expire cookies server-side.
    // We don't wait for the response — the cookies will be cleared immediately on the
    // next response via clearAuthCookies, and we update client state right away.
    fetch(`${API_URL}/v1/user/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {});

    setUser(null);

    if (deleted) {
      // Account was deleted by admin — send to homepage to sign up fresh
      window.location.href = "/";
    }
  }, []);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/v1/user/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setUser(null);
        }
        return false;
      }
      const data = await res.json();
      setUser(data.user);
      return true;
    } catch {
      return false;
    }
  }, []);

  // On mount — call /v1/user/me to restore session from httpOnly cookie.
  // If the access token expired, the refresh token cookie triggers a silent renewal.
  useEffect(() => {
    fetch(`${API_URL}/v1/user/me`, { credentials: "include" })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          return;
        }
        if (res.status === 401) {
          const data = await res.json().catch(() => ({}));
          if (data?.deleted === true) {
            logout(true);
            return;
          }
          // Access token expired — try refresh
          await refreshSession();
        }
      })
      .catch(() => {
        // Network error — treat as logged out
      })
      .finally(() => setReady(true));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refresh access token every 13 minutes (access token lasts 15 min)
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(refreshSession, 55 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user, refreshSession]);

  // Global fetch interceptor — auto-logout if backend says account was deleted
  useEffect(() => {
    if (!user) return;
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const res = await originalFetch(...args);
      if (res.status === 401) {
        const clone = res.clone();
        clone.json().then((data) => {
          if (data?.deleted === true) logout(true);
        }).catch(() => {});
      }
      return res;
    };
    return () => { window.fetch = originalFetch; };
  }, [user, logout]);

  if (!ready) return null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        ready,
        login,
        logout,
        refreshSession,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
