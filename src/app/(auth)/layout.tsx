"use client";

import ErrorBoundary from "@/components/ui/error-boundary";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-background">{children}</main>
    </ErrorBoundary>
  );
}
