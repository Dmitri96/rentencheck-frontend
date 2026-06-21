/**
 * Canonical app routes. Centralized so middleware + redirects + nav don't
 * diverge silently when a path changes.
 */

export const ROUTES = {
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  adminDashboard: "/dashboard/admin",
  pensionSettings: "/dashboard/admin/pension-settings",
  clients: "/dashboard/clients",
  newClient: "/dashboard/clients/new",
} as const;

export const PROTECTED_PREFIXES = ["/dashboard"] as const;
export const AUTH_PREFIXES = ["/login", "/register"] as const;
