"use client";

import { ReactNode } from "react";
import { useAuthContext } from "@/providers/auth-provider";

/**
 * Declarative permission gate.
 *
 * <PermissionGuard permission="manage_clients">
 *   <CreateClientButton />
 * </PermissionGuard>
 *
 * UI-only — the backend always re-authorizes server-side via Policy.
 * Use `permissions={[...]}` for any-of-many; `requireAll` for must-have-all.
 */
type PermissionGuardProps = {
  permission?: string;
  permissions?: string[];
  /** When true, user must have EVERY permission in `permissions`. Default: any-of. */
  requireAll?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
};

export function PermissionGuard({
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission } = useAuthContext();

  const list = permission ? [permission] : (permissions ?? []);
  if (list.length === 0) {
    return <>{children}</>;
  }

  const allowed = requireAll ? list.every((p) => hasPermission(p)) : hasAnyPermission(list);

  return <>{allowed ? children : fallback}</>;
}
