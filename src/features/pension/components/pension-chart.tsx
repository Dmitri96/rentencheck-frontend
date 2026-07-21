import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import annotationPlugin from "chartjs-plugin-annotation";
import type { PensionAnalysis } from "../hooks/use-pension-analysis";
import { DisabilityIncomeDiagram } from "./disability-income-diagram";
import { useChartConfig } from "../hooks/use-chart-config";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  annotationPlugin,
);

const formatNumber = (value: number) =>
  `${value.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

/**
 * Income projection chart (MVP Bild 1/2): stacked NET income bands vs the
 * inflated Rentenwunsch line. Renders the backend analysis only — there is
 * no client-side fallback calculation.
 */
export function PensionChart({ analysis }: { analysis: PensionAnalysis }) {
  const {
    chartData,
    options,
    hoverLinePlugin,
    totalGap,
    monthlyGapAtRetirement,
    totalIncomeAtRetirement,
  } = useChartConfig(analysis);

  const params = analysis.parameters_used;

  return (
    <div className="w-full">
      {/* Assumptions used */}
      <div className="rounded-md border px-4 py-3 mb-6 bg-[color-mix(in_oklch,var(--success)_10%,var(--background))] border-[color-mix(in_oklch,var(--success)_30%,var(--background))]">
        <p className="text-sm font-medium mb-2 text-success">
          Berechnung mit den hinterlegten Referenzwerten
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <ParamCell
            label="Inflation"
            value={`${analysis.inflationRate.toLocaleString("de-DE")}%`}
          />
          <ParamCell
            label="Rentensteigerung"
            value={`${params.economic_assumptions.pension_increase_rate.toLocaleString("de-DE")}%`}
          />
          <ParamCell
            label="KVdR gesamt"
            value={`${(params.social_insurance.total_insurance_rate ?? 0).toLocaleString("de-DE")}%`}
          />
          <ParamCell
            label="Kapitalrendite"
            value={`${params.economic_assumptions.investment_return_rate.toLocaleString("de-DE")}%`}
          />
        </div>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <ChartKpiTile
          label="Gesamtlücke im Ruhestand"
          value={formatNumber(totalGap)}
          hint={`Summe aller Jahre bis Alter ${analysis.provisionEndAge}`}
          tone={totalGap > 0 ? "destructive" : "success"}
        />
        <ChartKpiTile
          label="Monatliche Lücke zum Rentenbeginn"
          value={formatNumber(monthlyGapAtRetirement)}
          hint={`Monatlicher Fehlbetrag mit ${analysis.retirementAge} Jahren`}
          tone={monthlyGapAtRetirement > 0 ? "warning" : "success"}
        />
        <ChartKpiTile
          label="Monatliche Netto-Einnahmen"
          value={formatNumber(totalIncomeAtRetirement)}
          hint="Alle Einkommensquellen nach Steuern und KV"
        />
      </div>

      {/* Chart */}
      <div className="w-full mb-8" style={{ height: "500px", padding: "20px" }}>
        <Line data={chartData as any} options={options as any} plugins={[hoverLinePlugin as any]} />
      </div>

      {/* Disability income diagram */}
      <div className="mt-10">
        <DisabilityIncomeDiagram disability={analysis.disability} />
      </div>
    </div>
  );
}

/** Error state shown when the backend analysis is unavailable. */
export function PensionAnalysisError({ message }: { message?: string }) {
  return (
    <div className="rounded-md border border-destructive/40 bg-destructive/5 px-6 py-8 text-center">
      <p className="text-destructive font-medium mb-1">Berechnung nicht verfügbar</p>
      <p className="text-sm text-muted-foreground">
        Die Analyse konnte nicht vom Server geladen werden
        {message ? ` (${message})` : ""}. Bitte laden Sie die Seite neu oder versuchen Sie es später
        erneut.
      </p>
    </div>
  );
}

function ParamCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="block text-[var(--ink-tertiary)] text-xs">{label}</span>
      <span className="text-foreground font-mono tabular-nums">{value}</span>
    </div>
  );
}

function ChartKpiTile({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "destructive" | "warning" | "success";
}) {
  const valueColor =
    tone === "destructive"
      ? "text-destructive"
      : tone === "warning"
        ? "text-[color-mix(in_oklch,var(--warning)_85%,var(--foreground))]"
        : tone === "success"
          ? "text-success"
          : "text-foreground";
  return (
    <div className="rounded-md border border-border bg-card px-5 py-4">
      <p className="label-uppercase">{label}</p>
      <p
        className={`mt-2 text-[1.5rem] leading-none currency ${valueColor}`}
        style={{ fontFamily: "var(--font-display), Georgia, serif", fontWeight: 500 }}
      >
        {value}
      </p>
      <p className="text-xs text-[var(--ink-tertiary)] mt-2">{hint}</p>
    </div>
  );
}
