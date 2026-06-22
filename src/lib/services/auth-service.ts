import { ApiService } from "../api-service";
import { AuthResponse, LoginInput, RegisterInput, User, ApiError } from "@/types/auth";
import { AxiosError } from "axios";

/**
 * Authentication Service — network layer only.
 * State management (who is logged in) lives in useAuth via TanStack Query ['me'].
 * This service never reads or writes localStorage.
 */
export class AuthService {
  /**
   * Login user with email and password.
   * Returns the full auth response; the caller (useAuth) decides what to do with it.
   */
  static async login(credentials: LoginInput): Promise<AuthResponse> {
    try {
      const response = await ApiService.post<AuthResponse>("/auth/login", credentials);
      return response.data;
    } catch (error) {
      throw this.handleAuthError(error as AxiosError);
    }
  }

  /**
   * Register a new user account.
   */
  static async register(userData: RegisterInput): Promise<AuthResponse> {
    try {
      const response = await ApiService.post<AuthResponse>("/auth/register", userData);
      return response.data;
    } catch (error) {
      throw this.handleAuthError(error as AxiosError);
    }
  }

  /**
   * Terminate the current Sanctum session on the server.
   */
  static async logout(): Promise<void> {
    try {
      await ApiService.post("/auth/logout");
    } catch (error) {
      // Log and swallow — the caller still clears local cache regardless
      console.error("Logout error:", error);
    }
  }

  /**
   * Fetch the currently authenticated user from the server.
   * Used by the ['me'] TanStack Query to bootstrap auth state on page load.
   */
  static async getCurrentUser(): Promise<User> {
    try {
      const response = await ApiService.get<{ user: User }>("/auth/user");
      return response.data.user;
    } catch (error) {
      throw this.handleAuthError(error as AxiosError);
    }
  }

  /**
   * Handle authentication errors and normalise them into ApiError shape.
   */
  private static handleAuthError(error: AxiosError): ApiError {
    const data = (error.response?.data ?? {}) as {
      message?: string;
      errors?: Record<string, string[]>;
    };

    if (error.response?.status === 422) {
      return {
        message: data.message ?? "Validierungsfehler",
        errors: data.errors ?? {},
      };
    }

    if (error.response?.status === 401) {
      return { message: "Ungültige Anmeldedaten" };
    }

    if (error.response?.status === 429) {
      return { message: "Zu viele Anmeldeversuche. Bitte versuchen Sie es später erneut." };
    }

    return { message: data.message ?? "Ein unerwarteter Fehler ist aufgetreten" };
  }
}

export default AuthService;
