"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Customer, MembershipRequest } from "@/types";
import {
  signUp as authSignUp,
  login as authLogin,
  loginWithGoogle as authGoogle,
  loginWithFacebook as authFacebook,
  logout as authLogout,
  getCurrentUser,
  updateProfile as authUpdateProfile,
  refreshSessionFromStore,
} from "@/services/authService";

interface AuthContextValue {
  user: Customer | null;
  isAuthenticated: boolean;
  loading: boolean;
  signUp: (data: MembershipRequest) => Promise<Customer>;
  login: (email: string, password: string) => Promise<Customer>;
  loginWithGoogle: () => Promise<Customer>;
  loginWithFacebook: () => Promise<Customer>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Pick<Customer, "fullName" | "phone">>) => Promise<Customer>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  loading: true,
  signUp: () => Promise.reject(),
  login: () => Promise.reject(),
  loginWithGoogle: () => Promise.reject(),
  loginWithFacebook: () => Promise.reject(),
  logout: () => Promise.reject(),
  updateProfile: () => Promise.reject(),
  refreshUser: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(() => {
    // Refresh session from storage to pick up admin-side changes (e.g. membership approval)
    refreshSessionFromStore();
    const current = getCurrentUser();
    setUser(current);
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const handleSignUp = useCallback(async (data: MembershipRequest) => {
    const customer = await authSignUp(data);
    setUser(customer);
    return customer;
  }, []);

  const handleLogin = useCallback(async (email: string, password: string) => {
    const customer = await authLogin(email, password);
    setUser(customer);
    return customer;
  }, []);

  const handleGoogle = useCallback(async () => {
    const customer = await authGoogle();
    setUser(customer);
    return customer;
  }, []);

  const handleFacebook = useCallback(async () => {
    const customer = await authFacebook();
    setUser(customer);
    return customer;
  }, []);

  const handleLogout = useCallback(async () => {
    await authLogout();
    setUser(null);
  }, []);

  const handleUpdateProfile = useCallback(
    async (data: Partial<Pick<Customer, "fullName" | "phone">>) => {
      if (!user) throw new Error("Not authenticated");
      const updated = await authUpdateProfile(user.id, data);
      setUser(updated);
      return updated;
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        signUp: handleSignUp,
        login: handleLogin,
        loginWithGoogle: handleGoogle,
        loginWithFacebook: handleFacebook,
        logout: handleLogout,
        updateProfile: handleUpdateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
