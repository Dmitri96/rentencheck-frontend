"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Edit3, FileText } from "lucide-react";
import { PensionResultsOverview } from "@/features/pension";
import type { Rentencheck, RentencheckData } from "@/lib/services/rentencheck-service";

type RentenblickResultsProps = {
  data: RentencheckData;
  saving?: boolean;
  onEdit: () => void;
  onDownloadPdf?: () => void;
};

/**
 * The pension result views read `data.step_3_data?.payoutContracts` etc. —
 * shape from the persisted Rentencheck. During the live wizard we only have
 * flat form data, so reproject it into a step-keyed envelope before passing.
 */
function projectFormDataToRentencheck(data: RentencheckData): Rentencheck {
  return {
    id: 0,
    user_id: 0,
    client_id: 0,
    status: "draft",
    title: "",
    completed_steps: [],
    step_1_data: data,
    step_2_data: data,
    step_3_data: data,
    step_4_data: data,
    step_5_data: data,
    progress_percentage: 100,
    is_complete: false,
    created_at: "",
    updated_at: "",
  } as Rentencheck;
}

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
  const projected = useMemo(() => projectFormDataToRentencheck(data), [data]);

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

      <PensionResultsOverview data={projected} desiredPension={data.pensionWishCurrentValue} />

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
