"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/**
 * Generic dashboard error boundary. Sub-routes can override with their own
 * error.tsx to surface more specific recovery options.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard] caught:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6 text-center">
      <h2 className="text-xl font-semibold">Etwas ist schiefgelaufen</h2>
      <p className="text-muted-foreground max-w-md">
        Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.
      </p>
      {error.digest && <p className="text-xs text-muted-foreground">Fehler-ID: {error.digest}</p>}
      <Button onClick={reset}>Erneut versuchen</Button>
    </div>
  );
}
