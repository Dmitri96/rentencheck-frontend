"use client";

import React from "react";
import { useAuthContext } from "@/providers/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldX, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface RoleGuardProps {
  children: React.ReactNode;
  roles?: string[];
  permissions?: string[];
  fallback?: React.ReactNode;
  redirectTo?: string;
}

const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  roles = [],
  permissions = [],
  fallback,
  redirectTo = "/dashboard",
}) => {
  const { user, isAdmin, isAdvisor, hasPermission, hasAnyPermission } = useAuthContext();

  // Check if user has required roles
  const hasRequiredRole = (): boolean => {
    if (roles.length === 0) return true;

    const userRoles = user?.roles || [];
    return roles.some((role) => userRoles.includes(role));
  };

  // Check if user has required permissions
  const hasRequiredPermission = (): boolean => {
    if (permissions.length === 0) return true;

    return hasAnyPermission(permissions);
  };

  // Check access
  const hasAccess = hasRequiredRole() && hasRequiredPermission();

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-[var(--surface-subtle)] flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-[color-mix(in_oklch,var(--destructive)_15%,var(--background))] rounded-full flex items-center justify-center mb-4">
              <ShieldX className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-xl text-foreground">Zugriff verweigert</CardTitle>
            <CardDescription>
              Sie haben nicht die erforderlichen Berechtigungen, um auf diese Seite zuzugreifen.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-4">
              {roles.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Erforderliche Rollen:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {roles.map((role) => (
                      <span
                        key={role}
                        className="px-2 py-1 bg-muted text-foreground rounded text-xs"
                      >
                        {role === "admin"
                          ? "Administrator"
                          : role === "financial_advisor"
                            ? "Finanzberater"
                            : role}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {permissions.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Erforderliche Berechtigungen:
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {permissions.map((permission) => (
                      <span
                        key={permission}
                        className="px-2 py-1 bg-muted text-foreground rounded text-xs"
                      >
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4">
                <p className="text-sm text-muted-foreground mb-2">Ihre aktuelle Rolle:</p>
                <span className="px-3 py-1 bg-muted text-primary rounded-full text-sm font-medium">
                  {isAdmin ? "Administrator" : isAdvisor ? "Finanzberater" : "Benutzer"}
                </span>
              </div>

              <div className="pt-6">
                <Link href={redirectTo}>
                  <Button className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Zurück zum Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleGuard;
