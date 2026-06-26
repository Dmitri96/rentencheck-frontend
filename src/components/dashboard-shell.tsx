"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface DashboardShellProps {
  /** Page title — rendered as h1 in Fraunces. */
  title?: string;
  /** Optional secondary description shown below the title. */
  subtitle?: string;
  /**
   * Back-link target. When provided, renders an inline back link above the title
   * (e.g. "/dashboard/clients/42"). Omit for root-level pages.
   */
  backHref?: string;
  /** Text for the back link. Defaults to "Zurück". */
  backLabel?: string;
  /** Controls rendered on the right side of the top bar (e.g. save indicator, primary CTA). */
  headerActions?: React.ReactNode;
  /** Page body content. */
  children: React.ReactNode;
}

/*
 * DashboardShell — top bar + content frame.
 *
 * The sidebar is owned by (protected-pages)/layout.tsx via <Navigation />, so
 * this component is just the page header chrome: optional back link, page
 * title in Fraunces, optional headerActions on the right, and the main content
 * area centered to 1280px with generous padding.
 *
 * No sticky background blur / no gradient hero strip — paper register only.
 */
export function DashboardShell({
  title,
  subtitle,
  backHref,
  backLabel = "Zurück",
  headerActions,
  children,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Top bar — 64px height, hairline border, no shadow. Hidden in print. */}
      <header className="no-print sticky top-0 z-40 h-16 border-b border-border-subtle bg-background/95 backdrop-blur-[2px]">
        <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-8">
          <div className="flex min-w-0 items-center gap-4">
            {backHref ? (
              <Link
                href={backHref}
                className="group inline-flex items-center gap-2 text-[0.875rem] text-muted-foreground transition-colors duration-[180ms] hover:text-foreground"
              >
                <ArrowLeft className="size-4" strokeWidth={1.75} />
                <span>{backLabel}</span>
              </Link>
            ) : null}
          </div>
          <div className="flex items-center gap-3">{headerActions}</div>
        </div>
      </header>

      {/* Content area — max 1280px, generous padding */}
      <main className="mx-auto max-w-[1280px] px-8 py-10">
        {(title || subtitle) && (
          <header className="mb-10">
            {title && (
              <h1 className="font-display text-[clamp(2rem,3vw,2.5rem)] font-medium leading-[1.1] tracking-[-0.015em] text-foreground">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="mt-3 max-w-3xl text-[1.0625rem] leading-relaxed text-muted-foreground">
                {subtitle}
              </p>
            )}
          </header>
        )}
        {children}
      </main>
    </div>
  );
}
