"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LayoutDashboard, Users, Settings, LogOut, UserCog, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
  permissions?: string[];
}

const Navigation = () => {
  const { user, isAdmin, isAdvisor, logout, hasPermission } = useAuthContext();
  const pathname = usePathname();

  const navigationItems: NavigationItem[] = [
    // Admin-only items
    {
      href: "/dashboard/admin",
      label: "Admin Dashboard",
      icon: LayoutDashboard,
      roles: ["admin"],
    },
    {
      href: "/dashboard/admin/advisors",
      label: "Berater-Verwaltung",
      icon: UserCog,
      roles: ["admin"],
    },
    {
      href: "/dashboard/admin/pension-settings",
      label: "Pensionsparameter",
      icon: Settings,
      roles: ["admin"],
    },

    // Advisor and Admin items
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["financial_advisor", "admin"],
    },
    {
      href: "/dashboard/clients",
      label: "Kunden",
      icon: Users,
      roles: ["financial_advisor", "admin"],
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const isItemVisible = (item: NavigationItem): boolean => {
    // If no roles specified, show to everyone
    if (!item.roles && !item.permissions) {
      return true;
    }

    // Check role-based access
    if (item.roles) {
      const userRoles = user?.roles || [];
      const hasRequiredRole = item.roles.some((role) => userRoles.includes(role));
      if (!hasRequiredRole) {
        return false;
      }
    }

    // Check permission-based access
    if (item.permissions) {
      const hasRequiredPermission = item.permissions.some((permission) =>
        hasPermission(permission),
      );
      if (!hasRequiredPermission) {
        return false;
      }
    }

    return true;
  };

  const isActive = (href: string): boolean => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const visibleItems = navigationItems.filter(isItemVisible);

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        {/* User Info */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                {user?.first_name?.[0] || user?.name?.[0] || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {user?.full_name || user?.name || "Benutzer"}
                </p>
                <p className="text-sm text-gray-600 truncate">
                  {isAdmin ? "Administrator" : isAdvisor ? "Finanzberater" : "Benutzer"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Items */}
        <nav className="space-y-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={active ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-11",
                    active
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "text-gray-700 hover:bg-gray-100",
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Quick Actions for Admins */}
        {isAdmin && (
          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Schnellaktionen</h3>
            <div className="space-y-2">
              <Link href="/dashboard/admin/advisors/create">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Plus className="w-4 h-4" />
                  Neuer Berater
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Quick Actions for Advisors */}
        {isAdvisor && (
          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Schnellaktionen</h3>
            <div className="space-y-2">
              <Link href="/dashboard/clients/new">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Plus className="w-4 h-4" />
                  Neuer Kunde
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
            Abmelden
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
