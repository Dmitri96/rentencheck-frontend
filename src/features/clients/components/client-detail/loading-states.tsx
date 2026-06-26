"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export function ClientLoadingState() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card>
        <CardContent className="px-12 py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <h3 className="mb-2">Mandant wird geladen…</h3>
          <p className="text-muted-foreground">Bitte warten Sie einen Moment.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export function ClientErrorState() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card>
        <CardContent className="px-12 py-12 text-center">
          <AlertCircle className="h-10 w-10 mx-auto mb-4 text-destructive" strokeWidth={1.25} />
          <h3 className="mb-2">Mandant nicht gefunden</h3>
          <p className="text-muted-foreground mb-6">
            Der angeforderte Mandant konnte nicht geladen werden.
          </p>
          <Link href="/dashboard">
            <Button>Zurück zum Dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
