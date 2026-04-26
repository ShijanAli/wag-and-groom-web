import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type UserRole = "customer" | "staff" | "manager" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface StoredUser extends AuthUser {
  password: string;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string; user?: AuthUser }>;
  register: (data: { name: string; email: string; password: string; role: UserRole }) => Promise<{ ok: boolean; error?: string; user?: AuthUser }>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

const USERS_KEY = "happypaws_users";
const SESSION_KEY = "happypaws_session";

// Seed demo accounts (one per role) so users can quickly try every dashboard.
const seedUsers: StoredUser[] = [
  { id: "u-customer", name: "Sarah Johnson", email: "customer@demo.com", password: "demo1234", role: "customer" },
  { id: "u-staff", name: "Alex Rivera", email: "staff@demo.com", password: "demo1234", role: "staff" },
  { id: "u-manager", name: "Jamie Park", email: "manager@demo.com", password: "demo1234", role: "manager" },
  { id: "u-admin", name: "Ryan Cooper", email: "admin@demo.com", password: "demo1234", role: "admin" },
];

function loadUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify(seedUsers));
      return seedUsers;
    }
    return JSON.parse(raw);
  } catch {
    return seedUsers;
  }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setLoading(false);
  }, []);

  const persistSession = (u: AuthUser | null) => {
    if (u) localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    else localStorage.removeItem(SESSION_KEY);
  };

  const login = useCallback(async (email: string, password: string) => {
    const users = loadUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!found) return { ok: false, error: "No account found with this email." };
    if (found.password !== password) return { ok: false, error: "Incorrect password." };
    const safe: AuthUser = { id: found.id, name: found.name, email: found.email, role: found.role };
    setUser(safe);
    persistSession(safe);
    return { ok: true, user: safe };
  }, []);

  const register = useCallback(async (data: { name: string; email: string; password: string; role: UserRole }) => {
    const users = loadUsers();
    if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase().trim())) {
      return { ok: false, error: "An account with this email already exists." };
    }
    const newUser: StoredUser = {
      id: `u-${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim(),
      password: data.password,
      role: data.role,
    };
    saveUsers([...users, newUser]);
    const safe: AuthUser = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
    setUser(safe);
    persistSession(safe);
    return { ok: true, user: safe };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    persistSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export const roleHomePath: Record<UserRole, string> = {
  customer: "/dashboard",
  staff: "/staff",
  manager: "/manager",
  admin: "/admin",
};

export const roleLabel: Record<UserRole, string> = {
  customer: "Customer",
  staff: "Staff",
  manager: "Manager",
  admin: "Administrator",
};
