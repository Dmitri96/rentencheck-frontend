"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Edit3, FileText } from "lucide-react";
import { PensionResultsOverview } from "@/components/pension-results-overview";
import type { RentenblickData } from "@/components/rentenblick-form";

type RentenblickResultsProps = {
  data: RentenblickData;
  saving?: boolean;
  onEdit: () => void;
  onDownloadPdf?: () => void;
};

/**
 * Post-completion results view for the rentenblick wizard.
 * Pure presentation — all state lives in useRentenblickForm.
 */
export function RentenblickResults({
  data,
  saving = false,
  onEdit,
  onDownloadPdf,
}: RentenblickResultsProps) {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-green-800 flex items-center justify-center gap-3">
            <BarChart3 className="h-8 w-8" />
            Ihre Rentenbedarfsanalyse
          </CardTitle>
          <p className="text-green-700 mt-2">
            Basierend auf Ihren Angaben haben wir eine umfassende Analyse Ihrer Altersvorsorge
            erstellt.
          </p>
        </CardHeader>
      </Card>

      <PensionResultsOverview data={data} desiredPension={data.pensionWishCurrentValue} />

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={onEdit}
              variant="outline"
              className="flex items-center gap-2 px-6 py-3"
            >
              <Edit3 className="h-4 w-4" />
              Daten bearbeiten
            </Button>

            {onDownloadPdf && (
              <Button
                onClick={onDownloadPdf}
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Lädt...
                  </>
                ) : (
                  <>
                    <FileText className="h-5 w-5" />
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
