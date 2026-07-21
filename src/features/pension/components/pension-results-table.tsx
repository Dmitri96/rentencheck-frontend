"use client";

import type { PensionAnalysis } from "../hooks/use-pension-analysis";
import { PensionBreakdownTable } from "./pension-breakdown-table";

/**
 * Standalone card around the Bild-0 breakdown table for the analysis page.
 * All math happens in the backend; this only renders the analysis response.
 */
export function PensionResultsTable({ analysis }: { analysis: PensionAnalysis }) {
  const params = analysis.parameters_used;

  return (
    <div className="bg-card rounded-md border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border-subtle bg-[var(--surface-subtle)]">
        <h4 className="text-foreground font-medium">Berechnungstabelle</h4>
        <div className="mt-2 text-xs text-muted-foreground grid grid-cols-2 md:grid-cols-4 gap-2 font-mono tabular-nums">
          <div>Inflation: {analysis.inflationRate.toLocaleString("de-DE")} %</div>
          <div>
            Rentensteigerung:{" "}
            {params.economic_assumptions.pension_increase_rate.toLocaleString("de-DE")} %
          </div>
          <div>
            KVdR gesamt:{" "}
            {(params.social_insurance.total_insurance_rate ?? 0).toLocaleString("de-DE")} %
          </div>
          <div>
            Kapitalrendite:{" "}
            {params.economic_assumptions.investment_return_rate.toLocaleString("de-DE")} %
          </div>
        </div>
      </div>
      <PensionBreakdownTable analysis={analysis} />
    </div>
  );
}
