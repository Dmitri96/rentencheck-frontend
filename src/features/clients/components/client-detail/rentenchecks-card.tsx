"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Edit3, Download, Loader2, BarChart3 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { Rentencheck } from "@/lib/services/rentencheck-service";
import { RentencheckService } from "@/lib/services/rentencheck-service";
import {
  formatDate,
  getRentencheckStatusVariant,
  getRentencheckStatusText,
} from "@/lib/utils/client-utils";

interface RentenchecksCardProps {
  clientId: string;
  rentenchecks: Rentencheck[];
  loading: boolean;
}

export function RentenchecksCard({ clientId, rentenchecks, loading }: RentenchecksCardProps) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const handleCreateFirstRentencheck = async () => {
    try {
      setCreating(true);
      const response = await RentencheckService.createRentencheck(parseInt(clientId), {
        title: `Erster Rentencheck`,
      });
      router.push(`/dashboard/clients/${clientId}/rentencheck/${response.rentencheck.id}`);
    } catch (error: unknown) {
      console.error("Error creating rentencheck:", error);
      toast.error("Fehler beim Erstellen des Rentenchecks");
    } finally {
      setCreating(false);
    }
  };

  const handleDownloadPdf = async (rentencheckId: number) => {
    try {
      setCreating(true);
      await RentencheckService.downloadPdf(parseInt(clientId), rentencheckId);
      toast.success("PDF wird heruntergeladen…");
    } catch (error: unknown) {
      console.error("Error downloading PDF:", error);
      toast.error("Fehler beim Herunterladen des PDFs");
    } finally {
      setCreating(false);
    }
  };

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <FileText className="h-10 w-10 text-[var(--ink-tertiary)] mx-auto mb-4" strokeWidth={1.25} />
      <h3 className="mb-2">Noch keine Rentenchecks</h3>
      <p className="text-muted-foreground mb-6">
        Erstellen Sie den ersten Rentencheck für diesen Mandanten.
      </p>
      <Button onClick={handleCreateFirstRentencheck} disabled={creating}>
        {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        {creating ? "Erstelle…" : "Ersten Rentencheck erstellen"}
      </Button>
    </div>
  );

  const renderLoadingState = () => (
    <div className="text-center py-12">
      <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-4" />
      <p className="text-muted-foreground">Rentenchecks werden geladen…</p>
    </div>
  );

  const renderRentenchecksList = () => (
    <div className="space-y-3">
      {rentenchecks.map((check) => (
        <div
          key={check.id}
          className="border border-border-subtle rounded-md px-4 py-4 transition-colors duration-[180ms] hover:bg-[var(--surface-subtle)]"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h4 className="text-[1rem] font-medium text-foreground">{check.title}</h4>
              <div className="flex items-center flex-wrap gap-3 mt-2">
                <span className="text-sm text-muted-foreground">
                  Erstellt {formatDate(check.created_at)}
                </span>
                <Badge variant={getRentencheckStatusVariant(check.status)}>
                  {getRentencheckStatusText(check.status)}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Fortschritt:{" "}
                <span className="text-foreground font-medium currency">
                  {check.progress_percentage}%
                </span>
                <span className="ml-2 text-[var(--ink-tertiary)]">
                  ({check.completed_steps?.length || 0} von 5 Schritten)
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href={`/dashboard/clients/${clientId}/rentencheck/${check.id}`}>
                <Button variant="outline" size="icon" title="Bearbeiten">
                  <Edit3 className="h-4 w-4" />
                </Button>
              </Link>
              {check.status === "completed" && (
                <>
                  <Link href={`/dashboard/clients/${clientId}/rentencheck/${check.id}/analysis`}>
                    <Button variant="outline" size="icon" title="Analyse anzeigen">
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="icon"
                    title="PDF herunterladen"
                    onClick={() => handleDownloadPdf(check.id)}
                    disabled={creating}
                  >
                    {creating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rentenchecks</CardTitle>
      </CardHeader>
      <CardContent>
        {loading
          ? renderLoadingState()
          : rentenchecks.length === 0
            ? renderEmptyState()
            : renderRentenchecksList()}
      </CardContent>
    </Card>
  );
}
