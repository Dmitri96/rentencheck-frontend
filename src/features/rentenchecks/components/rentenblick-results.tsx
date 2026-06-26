"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit3, FileText } from "lucide-react";
import { PensionResultsOverview } from "@/features/pension";
import type { Rentencheck, RentencheckData } from "@/lib/services/rentencheck-service";

type RentenblickResultsProps = {
  data: RentencheckData;
  saving?: boolean;
  onEdit: () => void;
  onDownloadPdf?: () => void;
};

/**
 * Reproject the wizard's flat form data into the step-keyed envelope expected
 * by downstream result views (which read `data.step_3_data?.payoutContracts`).
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
 * Post-completion results — pure presentation. Action buttons sit in a
 * border-only card at the bottom so the chart + KPI hero own the visual stack.
 */
export function RentenblickResults({
  data,
  saving = false,
  onEdit,
  onDownloadPdf,
}: RentenblickResultsProps) {
  const projected = useMemo(() => projectFormDataToRentencheck(data), [data]);

  return (
    <div className="space-y-12">
      <PensionResultsOverview data={projected} desiredPension={data.pensionWishCurrentValue} />

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
