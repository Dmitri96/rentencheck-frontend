"use client";

import ErrorBoundary from "@/components/ui/error-boundary";
import Navigation from "@/components/dashboard-navigation";
import { useAuthContext } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // During server rendering or initial mount we render a quiet skeleton that
  // matches the actual chrome (sidebar + content) so hydration is identical
  // and there's no flash of grey-on-grey panels.
  if (!isMounted || isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-border bg-surface">
          <div className="h-16 border-b border-border-subtle" />
          <div className="space-y-1 p-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>
        </aside>
        <div className="flex-1">
          <div className="h-16 border-b border-border-subtle" />
          <div className="mx-auto max-w-[1280px] space-y-6 px-8 py-10">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-72 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // useEffect already pushes to /login; render nothing for the brief moment in between.
    return null;
  }

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen bg-background">
        <Navigation />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </ErrorBoundary>
  );
}
