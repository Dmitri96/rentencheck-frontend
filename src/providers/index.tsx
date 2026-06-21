"use client";

import React from "react";
import { AuthProvider } from "@/providers/AuthProvider";
import { QueryProvider } from "@/providers/QueryProvider";

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Order matters: QueryProvider wraps AuthProvider so the auth bootstrap can
 * eventually run as a useQuery against /api/auth/user (phase 8 migration).
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <AuthProvider>{children}</AuthProvider>
    </QueryProvider>
  );
}
