"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PropsWithChildren, useState } from "react";

/**
 * TanStack Query provider — server-state cache + per-query loading/error
 * state. New data-fetching code should use useQuery / useMutation instead of
 * useEffect + fetch.
 *
 * Defaults:
 * - staleTime 30s: lighten request frequency for chart-driven dashboards
 * - retry 1: avoid double-firing on transient errors but stop after one retry
 *   (Sanctum 401 is not retried — it's expected on logout)
 */
export function QueryProvider({ children }: PropsWithChildren) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
