import React, { createContext, ReactNode, useContext, useMemo } from "react";
import { LoginInput, RegisterInput, User } from "@/types/auth";
import { useAuth } from "@/hooks/useAuth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
  isAdvisor: boolean;
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): React.ReactElement {
  const auth = useAuth();

  // Memoize the context value so identity-only consumers don't re-render on
  // every parent render. Previously this object was rebuilt every render and
  // every auth consumer re-rendered cascadingly (audit finding).
  const contextValue = useMemo<AuthContextType>(
    () => ({
      ...auth,
      isAdmin: auth.user?.is_admin ?? false,
      isAdvisor: auth.user?.is_advisor ?? false,
      hasPermission: (permission: string) => auth.permissions.includes(permission),
      hasAnyPermission: (permissions: string[]) =>
        permissions.some((permission) => auth.permissions.includes(permission)),
    }),
    [auth],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
