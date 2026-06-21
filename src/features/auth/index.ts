/**
 * Auth feature public surface.
 *
 * Other features must import from this barrel only. Reaching into
 * `@/features/auth/components/...` from another feature is enforced-blocked
 * (phase 8 adds eslint-plugin-boundaries).
 *
 * Phase 8 moves the existing src/components/auth/* and src/components/forms/{Login,Register}Form
 * into this feature folder and exports them from here.
 */
export { PermissionGuard } from "@/components/auth/permission-guard";
export { useAuthContext, AuthProvider } from "@/providers/AuthProvider";
