import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  apiRequest,
  getToken,
  getUser,
  setToken,
  setUser,
} from "@/lib/api";

import type { User } from "@/lib/types";

type AuthContextType = {
  user: User | null;
  token: string | null;

  login: (phone: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext =
  createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setTokenState(await getToken());
      setUserState(await getUser());
    })();
  }, []);

  /* ---------------- LOGIN ---------------- */

  const login = async (phone: string, password: string) => {
    const res = await apiRequest<any>("/login", {
      method: "POST",
      body: { phone, password },
      auth: false,
    });

    await setToken(res.token);
    await setUser(res.user);

    setTokenState(res.token);
    setUserState(res.user);
  };

  /* ---------------- REGISTER ---------------- */

  const register = async (data: any) => {
    const res = await apiRequest<any>("/register", {
      method: "POST",
      body: data,
      auth: false,
    });

    await setToken(res.token);
    await setUser(res.user);

    setTokenState(res.token);
    setUserState(res.user);
  };

  const logout = async () => {
    await setToken(null);
    await setUser(null);
    setTokenState(null);
    setUserState(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthProvider missing");
  return ctx;
};