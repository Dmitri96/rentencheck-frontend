import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";

/**
 * Axios instance for API communication
 * Configured with base URL, interceptors for token management and error handling
 *
 * @deprecated New callers should use the typed openapi-fetch client from `@/lib/api`.
 *             This module is removed in Phase 7 (frontend foundations).
 */
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

/**
 * Request interceptor — Sanctum SPA uses session cookies; no bearer token needed.
 * withCredentials on the instance already sends the laravel_session cookie.
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => config,
  (error: unknown) => Promise.reject(error),
);

/**
 * Response interceptor for error handling and token refresh
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    const { response } = error;

    if (response?.status === 401) {
      // Sanctum session expired — redirect to login; no localStorage to clear
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      toast.error("Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.");
    } else if (response?.status === 403) {
      toast.error("Sie haben keine Berechtigung für diese Aktion.");
    } else if (response?.status === 404) {
      toast.error("Die angeforderte Ressource wurde nicht gefunden.");
    } else if (response?.status === 422) {
      // Validation errors - handled by individual components
      return Promise.reject(error);
    } else if (response && response.status >= 500) {
      toast.error("Ein Serverfehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
    } else if (error.code === "ECONNABORTED") {
      toast.error("Die Anfrage hat zu lange gedauert. Bitte versuchen Sie es erneut.");
    } else if (!response) {
      toast.error("Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.");
    }

    return Promise.reject(error);
  },
);

export default apiClient;
