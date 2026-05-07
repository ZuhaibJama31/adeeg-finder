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
import { setupFCM } from "@/lib/fcm";



/* ---------------- TYPES ---------------- */
 
type LoginPayload = {
  phone: string;
  password: string;
};
 
type RegisterPayload = {
  name: string;
  phone: string;
  password: string;
  city?: string;
  role: "client" | "worker";
};
 
type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};
 
/* ---------------- CONTEXT ---------------- */
 
const AuthContext = createContext<AuthContextType | null>(null);
 
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState]      = useState<User | null>(null);
  const [token, setTokenState]    = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
 
  /* Restore session on app launch */
  useEffect(() => {
    (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          getToken(),
          getUser(),
        ]);
        setTokenState(storedToken);
        setUserState(storedUser);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);
 
  /* ---------------- PERSIST SESSION ---------------- */
 
  const persistSession = async (newToken: string, newUser: User) => {
    await Promise.all([setToken(newToken), setUser(newUser)]);
    setTokenState(newToken);
    setUserState(newUser);
  };
 
  /* ---------------- LOGIN ---------------- */
 
const login = async (payload: LoginPayload) => {
  const res = await apiRequest<{ token: string; user: User }>("/login", {
    method: "POST",
    body: {
      phone: payload.phone,
      password: payload.password,
    },
    auth: false,
  });

  await persistSession(res.token, res.user);

  // ✅ SAFE FCM CALL
  try {
    await setupFCM();
  } catch (error) {
    console.log("FCM setup failed (ignored):", error);
  }
};
  /* ---------------- REGISTER ---------------- */
 
const register = async (payload: RegisterPayload) => {
  const res = await apiRequest<{ token: string; user: User }>("/register", {
    method: "POST",
    body: {
      name: payload.name,
      phone: payload.phone,
      password: payload.password,
      city: payload.city ?? null,
      role: payload.role,
    },
    auth: false,
  });

  await persistSession(res.token, res.user);

  // ✅ SAFE FCM CALL
  try {
    await setupFCM();
  } catch (error) {
    console.log("FCM setup failed (ignored):", error);
  }
};
  /* ---------------- LOGOUT ---------------- */
 
  const logout = async () => {
    try {
      await apiRequest("/logout", { method: "POST" });
    } catch {
      
    } finally {
      await Promise.all([setToken(null), setUser(null)]);
      setTokenState(null);
      setUserState(null);
    }
  };
 
  /* ---------------- REFRESH USER ---------------- */
 
  const refreshUser = async () => {
    const res = await apiRequest<User>("/me");
    await setUser(res);
    setUserState(res);
  };
 
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
 
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};