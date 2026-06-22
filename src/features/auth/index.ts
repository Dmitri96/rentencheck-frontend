/**
 * Auth feature public surface.
 *
 * All cross-feature consumers must import from this barrel.
 * Reaching into @/features/auth/components/* from another feature is blocked
 * (phase 8 adds eslint-plugin-boundaries).
 */
export { LoginForm } from "./components/login-form";
export { RegisterForm } from "./components/register-form";
export { AuthLayout } from "./components/auth-layout";
export { default as RoleGuard } from "./components/role-guard";
export { PermissionGuard } from "./components/permission-guard";
export { useAuthContext, AuthProvider } from "@/providers/auth-provider";
