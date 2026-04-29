import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  apiRequest,
  getStoredUser,
  getToken,
  setStoredUser,
  setToken,
} from "@/lib/api";
import type { AuthResponse, Role, User } from "@/lib/types";

type LoginInput = { phone: string; password: string };
type RegisterInput = {
  name: string;
  phone: string;
  password: string;
  role: Role;
  city?: string;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          getToken(),
          getStoredUser<User>(),
        ]);
        if (cancelled) return;
        if (storedToken) setTokenState(storedToken);
        if (storedUser) setUser(storedUser);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistAuth = useCallback(
    async (newToken: string, newUser: User) => {
      await setToken(newToken);
      await setStoredUser(newUser);
      setTokenState(newToken);
      setUser(newUser);
    },
    [],
  );

  const login = useCallback<AuthContextValue["login"]>(
    async ({ phone, password }) => {
      const res = await apiRequest<AuthResponse>("/login", {
        method: "POST",
        body: { phone, password },
        auth: false,
      });
      await persistAuth(res.token, res.user);
      return res.user;
    },
    [persistAuth],
  );

  const register = useCallback<AuthContextValue["register"]>(
    async (input) => {
      const res = await apiRequest<AuthResponse>("/register", {
        method: "POST",
        body: input,
        auth: false,
      });
      await persistAuth(res.token, res.user);
      return res.user;
    },
    [persistAuth],
  );

  const logout = useCallback(async () => {
    try {
      await apiRequest("/logout", { method: "POST" });
    } catch {
      // ignore network/logout errors — we still clear local session
    }
    await setToken(null);
    await setStoredUser(null);
    setTokenState(null);
    setUser(null);
  }, []);

  const refreshMe = useCallback(async () => {
    if (!token) return;
    try {
      const me = await apiRequest<User>("/me");
      setUser(me);
      await setStoredUser(me);
    } catch {
      // ignore — keep cached user
    }
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: !!token,
      login,
      register,
      logout,
      refreshMe,
    }),
    [user, token, isLoading, login, register, logout, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
