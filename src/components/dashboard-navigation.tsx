"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthContext } from "@/providers/auth-provider";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  UserCog,
  Plus,
  ChevronsUpDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavigationItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: string[];
  permissions?: string[];
}

/*
 * Sidebar — 264px fixed width, ivory surface, border-only right edge.
 *
 * Composition: monogram + wordmark at top, primary nav stack, quick-action
 * link, user identity card at the bottom (clicks open a small dropdown that
 * holds the logout — no logout button takes up sidebar space).
 *
 * Per the brief: no gradients, no glow, no chips with bright fills.
 */
const Navigation = () => {
  const { user, isAdmin, isAdvisor, logout, hasPermission } = useAuthContext();
  const pathname = usePathname();
  const router = useRouter();

  const navigationItems: NavigationItem[] = [
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
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["financial_advisor", "admin"],
    },
    {
      href: "/dashboard/clients",
      label: "Mandanten",
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
    router.push("/login");
  };

  const isItemVisible = (item: NavigationItem): boolean => {
    if (!item.roles && !item.permissions) return true;

    if (item.roles) {
      const userRoles = user?.roles || [];
      const hasRequiredRole = item.roles.some((role) => userRoles.includes(role));
      if (!hasRequiredRole) return false;
    }

    if (item.permissions) {
      const hasRequiredPermission = item.permissions.some((permission) =>
        hasPermission(permission),
      );
      if (!hasRequiredPermission) return false;
    }

    return true;
  };

  const isActive = (href: string): boolean => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const visibleItems = navigationItems.filter(isItemVisible);
  const initials = (user?.first_name?.[0] ?? user?.name?.[0] ?? "U") + (user?.last_name?.[0] ?? "");

  const roleLabel = isAdmin ? "Administrator" : isAdvisor ? "Finanzberater" : "Benutzer";

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-border bg-surface">
      {/* Wordmark — serif "R" monogram + sans wordmark. No gradient blob. */}
      <div className="flex h-16 items-center gap-3 border-b border-border-subtle px-5">
        <div
          aria-hidden
          className="flex h-9 w-9 items-center justify-center rounded-md bg-primary font-display text-[1.25rem] font-semibold text-primary-foreground"
        >
          R
        </div>
        <div className="leading-tight">
          <div className="font-display text-[1.0625rem] font-medium tracking-[-0.01em] text-foreground">
            Rentenblick
          </div>
          <div className="text-[0.6875rem] uppercase tracking-[0.08em] text-muted-foreground">
            Rentenberatung
          </div>
        </div>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <ul className="space-y-0.5">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-3 py-2 text-[0.9375rem] font-medium",
                    "transition-colors duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon
                    className={cn(
                      "size-[1.125rem] shrink-0",
                      active ? "text-primary-foreground" : "text-muted-foreground",
                    )}
                    strokeWidth={1.75}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Quick action — admins / advisors get one shortcut */}
        {(isAdmin || isAdvisor) && (
          <div className="mt-6 px-3">
            <div className="label-uppercase mb-2">Schnellaktion</div>
            <Link
              href={isAdmin ? "/dashboard/admin/advisors/create" : "/dashboard/clients/new"}
              className={cn(
                "flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2",
                "text-[0.875rem] font-medium text-foreground",
                "transition-colors duration-[180ms]",
                "hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Plus className="size-4 text-muted-foreground" strokeWidth={1.75} />
              {isAdmin ? "Neuer Berater" : "Neuer Mandant"}
            </Link>
          </div>
        )}
      </nav>

      {/* User card — dropdown holds logout, no standalone red logout button */}
      <div className="border-t border-border-subtle p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left",
                "transition-colors duration-[180ms]",
                "hover:bg-accent focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
              )}
            >
              <div
                aria-hidden
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary font-medium text-foreground"
              >
                {initials.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1 leading-tight">
                <div className="truncate text-[0.875rem] font-medium text-foreground">
                  {user?.full_name || user?.name || "Benutzer"}
                </div>
                <div className="truncate text-[0.75rem] text-muted-foreground">{roleLabel}</div>
              </div>
              <ChevronsUpDown
                className="size-4 shrink-0 text-muted-foreground"
                strokeWidth={1.75}
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" sideOffset={8} className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col">
                <span className="text-[0.875rem] font-medium text-foreground">
                  {user?.full_name || user?.name}
                </span>
                <span className="text-[0.75rem] text-muted-foreground">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-foreground">
              <LogOut className="mr-2 size-4 text-muted-foreground" strokeWidth={1.75} />
              Abmelden
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
};

export default Navigation;
