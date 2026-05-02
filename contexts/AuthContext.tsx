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
 
/* ---------------- TYPES ---------------- */
 
type FirebaseLoginPayload = {
  idToken: string;
  name?: string;
  phone?: string;
  city?: string;
  password?: string;
  mode?: "login" | "register";
};
 
type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
 
  firebaseLogin: (payload: FirebaseLoginPayload) => Promise<void>;
  logout: () => Promise<void>;
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
        setTokenState(storedToken);
        setUserState(storedUser);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);
 
  /* ---------------- FIREBASE LOGIN ---------------- */
  // Called after OTP is verified on the client side.
  // Sends the Firebase idToken to Laravel which verifies it,
  // finds-or-creates the user, and returns a Sanctum token.
 
  const firebaseLogin = async (payload: FirebaseLoginPayload) => {
    const res = await apiRequest<{ token: string; user: User }>("/firebase-login", {
      method: "POST",
      body: {
        idToken: payload.idToken,
        name: payload.name,
        phone: payload.phone,
        city: payload.city,
        // password is only used by Laravel to create the account on first register
        ...(payload.mode === "register" && { password: payload.password }),
      },
      auth: false,
    });
 
    // Persist token and user so the session survives app restarts
    await Promise.all([setToken(res.token), setUser(res.user)]);
 
    setTokenState(res.token);
    setUserState(res.user);
  };
 
  /* ---------------- LOGOUT ---------------- */
 
  const logout = async () => {
    try {
      // Tell Laravel to revoke the current token (best-effort)
      await apiRequest("/logout", { method: "POST" });
    } catch {
      // Ignore network errors on logout
    } finally {
      await Promise.all([setToken(null), setUser(null)]);
      setTokenState(null);
      setUserState(null);
    }
  };
 
  return (
    <AuthContext.Provider value={{ user, token, isLoading, firebaseLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
 
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};