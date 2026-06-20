import { useCallback, useEffect, useState } from "react";
import { LoginInput, RegisterInput, User, ApiError } from "@/types/auth";
import { clearAuth, getToken, getUser, saveToken, saveUser } from "@/lib/storage";
import { AuthService } from "@/lib/services/auth-service";
import { toast } from "sonner";

export interface UseAuthReturn {
  user: User | null;
  token: string | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  // Initialize with values that work for both server and client
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // This effect runs only once after the component mounts on the client
  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getUser();

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
      setIsAuthenticated(true);
      // Initialize permissions based on user role
      setPermissions(storedUser.roles || []);
    }

    setIsLoading(false);
  }, []);

  // Register a new user
  const register = useCallback(async (data: RegisterInput): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await AuthService.register(data);
      setToken(response.token);
      setUser(response.user);
      setPermissions(response.permissions || []);
      setIsAuthenticated(true);

      // Save to localStorage (AuthService already handles this, but we keep it for consistency)
      if (typeof window !== "undefined") {
        saveToken(response.token);
        saveUser(response.user);
      }

      toast.success("Registrierung erfolgreich!");
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.message || "Registrierung fehlgeschlagen";
      setError(errorMessage);

      // Handle validation errors
      if (apiError.errors) {
        Object.entries(apiError.errors).forEach(([field, messages]) => {
          toast.error(`${field}: ${messages.join(", ")}`);
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login user
  const login = useCallback(async (data: LoginInput): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await AuthService.login(data);
      setToken(response.token);
      setUser(response.user);
      setPermissions(response.permissions || []);
      setIsAuthenticated(true);

      // Save to localStorage (AuthService already handles this, but we keep it for consistency)
      if (typeof window !== "undefined") {
        saveToken(response.token);
        saveUser(response.user);
      }

      toast.success("Anmeldung erfolgreich!");
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.message || "Anmeldung fehlgeschlagen";
      setError(errorMessage);

      // Handle validation errors
      if (apiError.errors) {
        Object.entries(apiError.errors).forEach(([field, messages]) => {
          toast.error(`${field}: ${messages.join(", ")}`);
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout user
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await AuthService.logout();

      // Clear state and localStorage
      setToken(null);
      setUser(null);
      setPermissions([]);
      setIsAuthenticated(false);

      // Clear localStorage (AuthService already handles this, but we keep it for consistency)
      if (typeof window !== "undefined") {
        clearAuth();
      }

      toast.success("Erfolgreich abgemeldet");
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.message || "Fehler beim Abmelden";
      setError(errorMessage);
      toast.error(errorMessage);

      // Even if logout fails on server, clear local state
      setToken(null);
      setUser(null);
      setPermissions([]);
      setIsAuthenticated(false);

      if (typeof window !== "undefined") {
        clearAuth();
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  return {
    user,
    token,
    permissions,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };
}
