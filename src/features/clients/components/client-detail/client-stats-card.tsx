"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Client } from "@/types";
import type { Rentencheck } from "@/lib/services/rentencheck-service";
import { getClientStatusVariant, getClientStatusText } from "@/lib/utils/client-utils";

interface ClientStatsCardProps {
  client: Client;
  rentenchecks: Rentencheck[];
}

export function ClientStatsCard({ client, rentenchecks }: ClientStatsCardProps) {
  const completedRentenchecks = rentenchecks.filter((r) => r.status === "completed").length;
  const draftRentenchecks = rentenchecks.filter((r) => r.status === "draft").length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistiken</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Row label="Rentenchecks gesamt" value={String(rentenchecks.length)} />
        <Row label="Abgeschlossen" value={String(completedRentenchecks)} accent="success" />
        <Row label="Entwürfe" value={String(draftRentenchecks)} accent="warning" />

        <div className="flex justify-between items-center pt-2 border-t border-border-subtle">
          <span className="text-sm text-muted-foreground">Status</span>
          <Badge variant={getClientStatusVariant(client.is_active)}>
            {getClientStatusText(client.is_active)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "success" | "warning";
}) {
  const color =
    accent === "success"
      ? "text-success"
      : accent === "warning"
        ? "text-[color-mix(in_oklch,var(--warning)_85%,var(--foreground))]"
        : "text-foreground";
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`font-medium currency ${color}`}>{value}</span>
    </div>
  );
}
