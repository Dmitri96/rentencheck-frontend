import { ApiService } from "../api-service";
import { AuthResponse, LoginInput, RegisterInput, User, ApiError } from "@/types/auth";
import { AxiosError } from "axios";

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
export class AuthService {
  /**
   * Login user with email and password
   */
  static async login(credentials: LoginInput): Promise<AuthResponse> {
    try {
      const response = await ApiService.post<AuthResponse>("/auth/login", credentials);

      // Store token and user data in localStorage
      if (response.data.token) {
        localStorage.setItem("auth_token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      throw this.handleAuthError(error as AxiosError);
    }
  }

  /**
   * Register new user
   */
  static async register(userData: RegisterInput): Promise<AuthResponse> {
    try {
      const response = await ApiService.post<AuthResponse>("/auth/register", userData);

      // Store token and user data in localStorage
      if (response.data.token) {
        localStorage.setItem("auth_token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      throw this.handleAuthError(error as AxiosError);
    }
  }

  /**
   * Logout current user
   */
  static async logout(): Promise<void> {
    try {
      await ApiService.post("/auth/logout");
    } catch (error) {
      // Even if logout fails on server, clear local storage
      console.error("Logout error:", error);
    } finally {
      // Always clear local storage
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
    }
  }

  /**
   * Get current authenticated user
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
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("auth_token");
  }

  /**
   * Get stored user data
   */
  static getStoredUser(): User | null {
    if (typeof window === "undefined") return null;

    const userData = localStorage.getItem("user");
    if (!userData) return null;

    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  }

  /**
   * Get stored auth token
   */
  static getStoredToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  }

  /**
   * Handle authentication errors and format them properly
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
