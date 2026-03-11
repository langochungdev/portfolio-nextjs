"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface MockUser {
  email: string;
  displayName: string;
}

interface MockAuthContextType {
  user: MockUser | null;
  loading: boolean;
  login: (username: string) => void;
  logout: () => void;
}

const MockAuthContext = createContext<MockAuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

const STORAGE_KEY = "admin_mock_auth";

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = (username: string) => {
    const mockUser: MockUser = {
      email: `${username}@gmail.com`,
      displayName: username,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const logout = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <MockAuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </MockAuthContext.Provider>
  );
}

export function useMockAuth() {
  return useContext(MockAuthContext);
}
