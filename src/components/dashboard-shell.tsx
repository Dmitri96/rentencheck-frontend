"use client";

import React from "react";
import { ArrowLeft, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/providers/auth-provider";

interface DashboardShellProps {
  /** Page title shown in the top bar subtitle and as the h1 in the content area (optional) */
  title?: string;
  /** Secondary description shown below the title in the content area */
  subtitle?: string;
  /**
   * Back-link target. When provided, renders an arrow-back link in the top bar
   * (e.g. "/dashboard/clients/42"). Omit for root-level pages.
   */
  backHref?: string;
  /** Text for the back link. Defaults to "Zurück". */
  backLabel?: string;
  /** Extra controls rendered on the right side of the top bar (e.g. save-indicator). */
  headerActions?: React.ReactNode;
  /** Page body content. */
  children: React.ReactNode;
}

/**
 * Shared top-bar chrome for every authenticated page.
 *
 * The sidebar navigation lives in (protected-pages)/layout.tsx via <Navigation />.
 * DashboardShell owns the sticky top bar only: logo, optional back-link, logout,
 * and optional custom headerActions (e.g. a saving spinner).
 *
 * Usage:
 *   <DashboardShell title="Mein Dashboard" subtitle="Überblick über Ihre Mandanten">
 *     <YourPageContent />
 *   </DashboardShell>
 */
export function DashboardShell({
  title,
  subtitle,
  backHref,
  backLabel = "Zurück",
  headerActions,
  children,
}: DashboardShellProps) {
  const router = useRouter();
  const { logout } = useAuthContext();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Sticky top bar */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: optional back arrow + logo + subtitle */}
            <div className="flex items-center space-x-4">
              {backHref && (
                <Link
                  href={backHref}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>{backLabel}</span>
                </Link>
              )}
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">RENTENBLICK.de</h1>
                {title && <p className="text-sm text-gray-600">{title}</p>}
              </div>
            </div>

            {/* Right: caller-supplied actions + logout */}
            <div className="flex items-center space-x-4">
              {headerActions}
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Page content area */}
      <div className="container mx-auto px-6 py-8">
        {(title || subtitle) && (
          <div className="mb-8">
            {title && <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>}
            {subtitle && <p className="text-gray-600">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
