"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin] caught:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 p-6 text-center">
      <h2 className="text-xl font-semibold">Admin-Bereich nicht verfügbar</h2>
      <p className="text-muted-foreground max-w-md">
        Ein Fehler ist beim Laden des Admin-Bereichs aufgetreten.
      </p>
      <Button onClick={reset}>Erneut versuchen</Button>
    </div>
  );
}
