"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  plan: "free" | "pro";
};

type AuthContextType = {
  user: AuthUser | null;
  accessToken: string | null;
  isLoggedIn: boolean;
  login: (accessToken: string, refreshToken: string, user: AuthUser) => void;
  logout: () => void;
  refreshSession: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  accessToken: null,
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
  refreshSession: async () => false,
});

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://fedey-backend-production.up.railway.app";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // On mount — restore session from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("furci_user");
    const token = localStorage.getItem("furci_access_token");
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
        setAccessToken(token);
      } catch {
        localStorage.removeItem("furci_user");
        localStorage.removeItem("furci_access_token");
      }
    }
    setReady(true);
  }, []);

  const login = useCallback(
    (newAccessToken: string, refreshToken: string, newUser: AuthUser) => {
      setUser(newUser);
      setAccessToken(newAccessToken);
      localStorage.setItem("furci_access_token", newAccessToken);
      localStorage.setItem("furci_refresh_token", refreshToken);
      localStorage.setItem("furci_user", JSON.stringify(newUser));
    },
    []
  );

  const logout = useCallback(() => {
    const refresh = localStorage.getItem("furci_refresh_token");
    if (refresh) {
      fetch(`${API_URL}/v1/user/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: refresh }),
      }).catch(() => {});
    }
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("furci_access_token");
    localStorage.removeItem("furci_refresh_token");
    localStorage.removeItem("furci_user");
  }, []);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    const refresh = localStorage.getItem("furci_refresh_token");
    if (!refresh) return false;
    try {
      const res = await fetch(`${API_URL}/v1/user/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: refresh }),
      });
      if (!res.ok) {
        logout();
        return false;
      }
      const data = await res.json();
      login(data.accessToken, data.refreshToken, data.user);
      return true;
    } catch {
      logout();
      return false;
    }
  }, [login, logout]);

  // Auto-refresh access token every 13 minutes (access token lasts 15 min)
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(refreshSession, 13 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user, refreshSession]);

  if (!ready) return null;

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoggedIn: !!user,
        login,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
