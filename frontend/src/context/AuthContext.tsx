"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: string;
  username: string;
  full_name: string;
  email?: string;
  role: string;
  target_role_id?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<User>;
  register: (
    username: string,
    password: string,
    fullName: string,
    email?: string,
    targetRoleId?: string
  ) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const rawApiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_BASE = rawApiBase.replace(/\/+$/, "").replace(/\/api$/, "");

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore user & token from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("skill_gap_user");
      const storedToken = localStorage.getItem("skill_gap_token");
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (e) {
      console.warn("Failed to restore session from localStorage:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string): Promise<User> => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      let errDetail = "Failed to sign in";
      try {
        const data = await res.json();
        errDetail = data.detail || errDetail;
      } catch (_) {}
      throw new Error(errDetail);
    }

    const data = await res.json();
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("skill_gap_user", JSON.stringify(data.user));
    localStorage.setItem("skill_gap_token", data.token);
    return data.user;
  };

  const register = async (
    username: string,
    password: string,
    fullName: string,
    email?: string,
    targetRoleId?: string
  ): Promise<User> => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        password,
        full_name: fullName,
        email: email || undefined,
        target_role_id: targetRoleId || undefined,
      }),
    });

    if (!res.ok) {
      let errDetail = "Registration failed";
      try {
        const data = await res.json();
        errDetail = data.detail || errDetail;
      } catch (_) {}
      throw new Error(errDetail);
    }

    const data = await res.json();
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("skill_gap_user", JSON.stringify(data.user));
    localStorage.setItem("skill_gap_token", data.token);
    return data.user;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("skill_gap_user");
    localStorage.removeItem("skill_gap_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
