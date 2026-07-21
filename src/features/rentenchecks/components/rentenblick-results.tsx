"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit3, FileText, Loader2 } from "lucide-react";
import {
  CapitalRequirementChart,
  PensionAnalysisError,
  PensionChart,
  PensionResultsOverview,
  usePensionAnalysis,
} from "@/features/pension";

type RentenblickResultsProps = {
  clientId?: number;
  rentencheckId?: number;
  saving?: boolean;
  onEdit: () => void;
  onDownloadPdf?: () => void;
};

/**
 * Post-completion results — pure presentation of the backend analysis.
 *
 * The steps are already persisted when this renders, so the engine computes
 * from the saved data; there is no client-side projection of form state.
 */
export function RentenblickResults({
  clientId,
  rentencheckId,
  saving = false,
  onEdit,
  onDownloadPdf,
}: RentenblickResultsProps) {
  const { analysis, loading, error } = usePensionAnalysis(clientId, rentencheckId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Berechnung mit aktuellen Referenzwerten…</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="space-y-6">
        <PensionAnalysisError message={error ?? undefined} />
        <div className="flex justify-end">
          <Button onClick={onEdit} variant="outline">
            <Edit3 className="h-4 w-4" />
            Daten bearbeiten
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* 1. KPI summary + Bild-0 breakdown table */}
      <PensionResultsOverview analysis={analysis} />

      {/* 2. Pension timeline + BU diagram */}
      <Card data-elevated="true">
        <CardHeader>
          <CardTitle>Rentenverlauf über die Zeit</CardTitle>
          <p className="text-sm text-muted-foreground">
            Visualisierung der Rentenentwicklung mit Inflation und Versorgungslücke
          </p>
        </CardHeader>
        <CardContent>
          <PensionChart analysis={analysis} />
        </CardContent>
      </Card>

      {/* 3. Capital requirement (Bild 3) */}
      <CapitalRequirementChart analysis={analysis} />

      {/* 4. Actions — edit + PDF — hidden in print */}
      <Card className="no-print">
        <CardContent className="px-6 py-5">
          <div className="flex flex-col sm:flex-row gap-3 justify-end items-center">
            <Button onClick={onEdit} variant="outline">
              <Edit3 className="h-4 w-4" />
              Daten bearbeiten
            </Button>

            {onDownloadPdf && (
              <Button onClick={onDownloadPdf} disabled={saving}>
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                    Lädt…
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    PDF-Bericht herunterladen
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
