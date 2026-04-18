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
  ready: boolean;
  login: (accessToken: string, refreshToken: string, user: AuthUser) => void;
  logout: (deleted?: boolean) => void;
  refreshSession: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  accessToken: null,
  isLoggedIn: false,
  ready: false,
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

  // On mount — restore session from localStorage, then silently refresh
  // to validate the token and get a fresh one if the access token expired
  useEffect(() => {
    const stored = localStorage.getItem("furci_user");
    const token = localStorage.getItem("furci_access_token");
    const refreshToken = localStorage.getItem("furci_refresh_token");

    if (stored && token) {
      try {
        // Restore immediately so the UI doesn't flash logged-out
        setUser(JSON.parse(stored));
        setAccessToken(token);
      } catch {
        localStorage.removeItem("furci_user");
        localStorage.removeItem("furci_access_token");
      }
    }

    // If we have a refresh token, validate the session in the background.
    // This handles the case where the access token expired while the user
    // was away — they stay logged in seamlessly.
    if (refreshToken) {
      fetch(`${API_URL}/v1/user/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      })
        .then((res) => {
          if (res.ok) return res.json();
          if (res.status === 401 || res.status === 403) {
            return res.json().then((data) => {
              if (data?.deleted === true) {
                logout(true); // account deleted — redirect home
              } else {
                setUser(null);
                setAccessToken(null);
                localStorage.removeItem("furci_access_token");
                localStorage.removeItem("furci_refresh_token");
                localStorage.removeItem("furci_user");
              }
              return null;
            });
          }
          // For other errors (500, network) keep the existing session as-is
          return null;
        })
        .then((data) => {
          if (!data) return;
          setUser(data.user);
          setAccessToken(data.accessToken);
          localStorage.setItem("furci_access_token", data.accessToken);
          localStorage.setItem("furci_refresh_token", data.refreshToken);
          localStorage.setItem("furci_user", JSON.stringify(data.user));
        })
        .catch(() => {
          // Network error — keep existing session, don't log out
        })
        .finally(() => setReady(true));
      return; // setReady will be called inside the promise chain
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
      // Clear stale onboarding flags so the home page always shows the right button
      localStorage.removeItem("furci_has_dashboard");
      localStorage.removeItem("furci_return_url");
    },
    []
  );

  const logout = useCallback((deleted = false) => {
    const refresh = localStorage.getItem("furci_refresh_token");
    if (refresh && !deleted) {
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
    localStorage.removeItem("furci_return_url");
    localStorage.removeItem("furci_has_dashboard");
    if (deleted) {
      // Account was deleted by admin — send to homepage to sign up fresh
      window.location.href = "/";
    }
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

  // On mount, once session is restored, validate it against the backend.
  // This catches deleted accounts immediately — even before any page API call.
  useEffect(() => {
    if (!ready || !user) return;
    const token = localStorage.getItem("furci_access_token");
    if (!token) return;
    fetch(`${API_URL}/v1/user/me`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      if (res.status === 401) {
        res.json().then((data) => {
          if (data?.deleted === true) {
            logout(true);
          } else {
            // Token expired — try refresh
            refreshSession();
          }
        }).catch(() => {});
      }
    }).catch(() => {});
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

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
        accessToken,
        isLoggedIn: !!user,
        ready,
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
