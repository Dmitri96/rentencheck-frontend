"use client";

import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoginInput, RegisterInput, User, ApiError } from "@/types/auth";
import { AuthService } from "@/lib/services/auth-service";
import { ensureCsrfCookie, resetCsrfCookieCache } from "@/lib/api";
import { toast } from "sonner";

export interface UseAuthReturn {
  user: User | null;
  token: string | null; // kept for API shape compatibility; always null (no localStorage)
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

/**
 * Fetches the current session user from the server via Sanctum session cookies.
 * Returns null on 401 (not authenticated) instead of throwing.
 */
async function fetchCurrentUser(): Promise<User | null> {
  try {
    return await AuthService.getCurrentUser();
  } catch {
    // 401 → not logged in; treat as unauthenticated rather than an error
    return null;
  }
}

export function useAuth(): UseAuthReturn {
  const queryClient = useQueryClient();

  // Server-state bootstrap: replace the old localStorage useEffect.
  // isLoading is true during the initial fetch, false once we know auth state.
  const {
    data: user = null,
    isLoading,
    error: queryError,
  } = useQuery<User | null>({
    queryKey: ["me"],
    queryFn: fetchCurrentUser,
    // Stale after 60s; re-validates on window focus by default is off (set in QueryProvider)
    staleTime: 60_000,
    retry: 0, // 401 is expected when not logged in — don't hammer the endpoint
  });

  // Login mutation: warms CSRF cookie, calls AuthService, then re-fetches ['me']
  const loginMutation = useMutation<void, ApiError, LoginInput>({
    mutationFn: async (credentials) => {
      await ensureCsrfCookie();
      await AuthService.login(credentials);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success("Anmeldung erfolgreich!");
    },
    onError: (err) => {
      const errorMessage = err.message || "Anmeldung fehlgeschlagen";
      if (err.errors) {
        Object.entries(err.errors).forEach(([field, messages]) => {
          toast.error(`${field}: ${messages.join(", ")}`);
        });
      } else {
        toast.error(errorMessage);
      }
    },
  });

  // Register mutation: same CSRF → register → invalidate ['me']
  const registerMutation = useMutation<void, ApiError, RegisterInput>({
    mutationFn: async (input) => {
      await ensureCsrfCookie();
      await AuthService.register(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success("Registrierung erfolgreich!");
    },
    onError: (err) => {
      const errorMessage = err.message || "Registrierung fehlgeschlagen";
      if (err.errors) {
        Object.entries(err.errors).forEach(([field, messages]) => {
          toast.error(`${field}: ${messages.join(", ")}`);
        });
      } else {
        toast.error(errorMessage);
      }
    },
  });

  // Logout mutation: clears server session, nulls ['me'] cache, resets CSRF
  const logoutMutation = useMutation<void, ApiError, void>({
    mutationFn: () => AuthService.logout(),
    onSuccess: () => {
      queryClient.setQueryData(["me"], null);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      resetCsrfCookieCache();
      toast.success("Erfolgreich abgemeldet");
    },
    onError: (err) => {
      // Even on failure, clear local cache so the UI reflects logout
      queryClient.setQueryData(["me"], null);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      resetCsrfCookieCache();
      toast.error(err.message || "Fehler beim Abmelden");
    },
  });

  const login = useCallback(
    async (data: LoginInput): Promise<void> => {
      await loginMutation.mutateAsync(data);
    },
    [loginMutation],
  );

  const register = useCallback(
    async (data: RegisterInput): Promise<void> => {
      await registerMutation.mutateAsync(data);
    },
    [registerMutation],
  );

  const logout = useCallback(async (): Promise<void> => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  // clearError is a no-op for API compat; mutation errors are transient in TanStack Query
  const clearError = useCallback((): void => {}, []);

  const permissions = user?.roles ?? [];

  const error =
    loginMutation.error?.message ??
    registerMutation.error?.message ??
    logoutMutation.error?.message ??
    (queryError ? String(queryError) : null);

  return {
    user: user ?? null,
    token: null, // session-cookie auth; no bearer token stored in frontend
    permissions,
    isAuthenticated: !!user,
    isLoading:
      isLoading ||
      loginMutation.isPending ||
      registerMutation.isPending ||
      logoutMutation.isPending,
    error,
    login,
    register,
    logout,
    clearError,
  };
}
