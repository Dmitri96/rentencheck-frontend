import { api, ensureCsrfCookie } from "@/lib/api";
import type { ApiError, AuthResponse, LoginInput, RegisterInput, User } from "@/types/auth";
import type { components } from "@/lib/api/schema";

type UserResource = components["schemas"]["UserResource"];

function mapUserResource(resource: UserResource): User {
  return {
    id: resource.id,
    name: resource.name,
    first_name: resource.first_name,
    last_name: resource.last_name,
    full_name: resource.full_name,
    email: resource.email,
    phone: resource.phone ?? undefined,
    company: resource.company ?? undefined,
    plan: resource.plan,
    status: resource.status as User["status"],
    newsletter: resource.newsletter,
    roles: resource.roles ? Object.values(resource.roles).map(String) : [],
    is_admin: resource.is_admin,
    is_advisor: resource.is_advisor,
    is_active: resource.is_active,
    is_blocked: resource.is_blocked,
    email_verified_at: resource.email_verified_at || undefined,
    created_at: resource.created_at || undefined,
    updated_at: resource.updated_at || undefined,
  };
}

/**
 * Authentication service — thin facade over the typed openapi-fetch client.
 * State management lives in useAuth via TanStack Query ['me'].
 * Never reads or writes localStorage.
 */
export class AuthService {
  /**
   * Login user with email and password.
   * Warms the CSRF cookie first (Sanctum SPA requirement).
   */
  static async login(credentials: LoginInput): Promise<AuthResponse> {
    await ensureCsrfCookie();

    const { data, error } = await api.POST("/auth/login", {
      body: {
        email: credentials.email,
        password: credentials.password,
        remember_me: credentials.remember_me,
      },
    });

    if (error) {
      throw this.normaliseError(error as ApiError);
    }

    return {
      user: mapUserResource(data.data.user),
      // Token is still issued by backend but frontend uses session cookies.
      token: data.data.token,
      message: data.message,
    };
  }

  /**
   * Register a new user account.
   */
  static async register(userData: RegisterInput): Promise<AuthResponse> {
    await ensureCsrfCookie();

    const { data, error } = await api.POST("/auth/register", {
      body: {
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        phone: userData.phone,
        company: userData.company,
        plan: userData.plan as "free" | "basic" | "premium" | "vip",
        password: userData.password,
        password_confirmation: userData.password_confirmation,
        accept_terms: userData.accept_terms,
        accept_privacy: userData.accept_privacy,
        newsletter: userData.newsletter,
      },
    });

    if (error) {
      throw this.normaliseError(error as ApiError);
    }

    return {
      user: mapUserResource(data.data.user),
      token: data.data.token,
      message: data.message,
    };
  }

  /**
   * Terminate the current Sanctum session on the server.
   */
  static async logout(): Promise<void> {
    try {
      await api.POST("/auth/logout", {});
    } catch (err) {
      // Swallow — caller still clears local cache regardless
      console.error("Logout error:", err);
    }
  }

  /**
   * Fetch the currently authenticated user from the server.
   * Used by the ['me'] TanStack Query to bootstrap auth state on page load.
   */
  static async getCurrentUser(): Promise<User> {
    const { data, error } = await api.GET("/auth/user");

    if (error) {
      throw this.normaliseError(error as ApiError);
    }

    return mapUserResource(data.data.user);
  }

  private static normaliseError(error: ApiError): ApiError {
    return {
      message: error.message ?? "Ein unerwarteter Fehler ist aufgetreten",
      errors: error.errors,
    };
  }
}

export default AuthService;
