"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { getFirebaseAuth } from "@/lib/firebase/config";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";

interface AdminUser {
  email: string;
  displayName: string;
  uid: string;
}

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => null,
  logout: async () => {},
});

function toAdminUser(fbUser: User): AdminUser {
  const name = fbUser.email?.replace(/@.*$/, "") ?? "";
  return { email: fbUser.email ?? "", displayName: name, uid: fbUser.uid };
}

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(getFirebaseAuth(), (fbUser) => {
      setUser(fbUser ? toAdminUser(fbUser) : null);
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (username: string, password: string): Promise<string | null> => {
    const email = username.includes("@") ? username : `${username}@gmail.com`;
    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      return null;
    } catch (err) {
      const code = (err as { code?: string }).code ?? "";
      if (code === "auth/invalid-credential" || code === "auth/user-not-found" || code === "auth/wrong-password") {
        return "Sai tài khoản hoặc mật khẩu";
      }
      return code || "Đăng nhập thất bại";
    }
  };

  const logout = async () => {
    await signOut(getFirebaseAuth());
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useMockAuth() {
  return useContext(AuthContext);
}
