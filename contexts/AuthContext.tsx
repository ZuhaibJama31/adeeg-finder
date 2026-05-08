import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import {
  apiRequest,
  getToken,
  getUser,
  setToken,
  setUser,
  savePushToken,
} from "@/lib/api";

import type { User } from "@/lib/types";
import { setupNotifications } from "@/lib/notifications";

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
  const [user, setUserState] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* Restore session on app launch */
  useEffect(() => {
    (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          getToken(),
          getUser(),
        ]);
        
        if (storedToken && storedUser) {
          setTokenState(storedToken);
          setUserState(storedUser);
          
          // Setup notifications for ALL authenticated users
          setupNotifications().catch(err => 
            console.warn('Notification setup failed:', err)
          );
        }
      } catch (error) {
        console.error('Session restore failed:', error);
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

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await apiRequest<{ token: string; user: User }>("/login", {
      method: "POST",
      body: {
        phone: payload.phone,
        password: payload.password,
      },
      auth: false,
    });

    await persistSession(res.token, res.user);

    // Setup notifications for ALL users after login
    setupNotifications().catch(err => 
      console.warn('Notification setup failed:', err)
    );
  }, []);

  /* ---------------- REGISTER ---------------- */

  const register = useCallback(async (payload: RegisterPayload) => {
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

    // Setup notifications for ALL users after registration
    setupNotifications().catch(err => 
      console.warn('Notification setup failed:', err)
    );
  }, []);

  /* ---------------- LOGOUT ---------------- */

  const logout = useCallback(async () => {
    try {
      await apiRequest("/logout", { method: "POST" });
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      await Promise.all([setToken(null), setUser(null)]);
      setTokenState(null);
      setUserState(null);
    }
  }, []);

  /* ---------------- REFRESH USER ---------------- */

  const refreshUser = useCallback(async () => {
    try {
      const res = await apiRequest<User>("/me");
      await setUser(res);
      setUserState(res);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, []);

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