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
import type { Rentencheck } from "@/lib/services/rentencheck-service";
import { DisabilityIncomeDiagram } from "./disability-income-diagram";
import { usePensionCalculation, type PensionData } from "@/features/pension";
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

interface PensionChartProps {
  data: Rentencheck;
  desiredPension: number;
}

const formatNumber = (value: number) =>
  `${value.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

export function PensionChart({ data, desiredPension }: PensionChartProps) {
  const clientId = data.client_id;
  const rentencheckId = data.id;

  const { pensionData, loading } = usePensionCalculation(clientId, rentencheckId, desiredPension);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-border border-t-primary mx-auto mb-3"></div>
          <p className="text-sm text-muted-foreground">
            Berechnung mit aktuellen Admin-Parametern…
          </p>
        </div>
      </div>
    );
  }

  const resolvedData = pensionData ?? createFallbackPensionData(data, desiredPension);
  return (
    <PensionChartInner pensionData={resolvedData} desiredPension={desiredPension} rootData={data} />
  );
}

/** Thin render layer — all chart math delegated to useChartConfig. */
function PensionChartInner({
  pensionData,
  desiredPension,
  rootData,
}: {
  pensionData: PensionData;
  desiredPension: number;
  rootData: Rentencheck;
}) {
  const {
    chartData,
    options,
    hoverLinePlugin,
    totalGap,
    monthlyGapAtRetirement,
    totalIncomeAtRetirement,
  } = useChartConfig(pensionData, desiredPension, rootData);

  const { parameters, isBackendCalculation, retirementAge } = pensionData;

  return (
    <div className="w-full">
      {/* Calculation source indicator */}
      <div
        className={`rounded-md border px-4 py-3 mb-6 ${
          isBackendCalculation
            ? "bg-[color-mix(in_oklch,var(--success)_10%,var(--background))] border-[color-mix(in_oklch,var(--success)_30%,var(--background))]"
            : "bg-[color-mix(in_oklch,var(--warning)_15%,var(--background))] border-[color-mix(in_oklch,var(--warning)_30%,var(--background))]"
        }`}
      >
        <p
          className={`text-sm font-medium mb-2 ${
            isBackendCalculation
              ? "text-success"
              : "text-[color-mix(in_oklch,var(--warning)_85%,var(--foreground))]"
          }`}
        >
          {isBackendCalculation
            ? "Backend-Berechnung mit dynamischen Admin-Parametern"
            : "Fallback-Berechnung (Frontend)"}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <ParamCell
            label="Inflation"
            value={`${parameters.economic_assumptions.inflation_rate}%`}
          />
          <ParamCell
            label="Krankenversicherung"
            value={`${parameters.social_insurance.health_insurance_rate}%`}
          />
          <ParamCell
            label="Pflegeversicherung"
            value={`${parameters.social_insurance.care_insurance_rate}%`}
          />
          <ParamCell
            label="Kapitalrendite"
            value={`${parameters.economic_assumptions.investment_return_rate}%`}
          />
        </div>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <ChartKpiTile
          label="Gesamtlücke im Ruhestand"
          value={formatNumber(totalGap)}
          hint="Summe aller Ruhestandsjahre, 12 Monate pro Jahr"
          tone="destructive"
        />
        <ChartKpiTile
          label="Monatliche Lücke zum Rentenbeginn"
          value={formatNumber(monthlyGapAtRetirement)}
          hint={`Monatlicher Fehlbetrag mit ${retirementAge} Jahren`}
          tone="warning"
        />
        <ChartKpiTile
          label="Gesamte monatliche Einnahmen"
          value={formatNumber(totalIncomeAtRetirement)}
          hint="Alle Einkommensquellen kombiniert"
        />
      </div>

      {/* Chart */}
      <div className="w-full mb-8" style={{ height: "500px", padding: "20px" }}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <Line data={chartData as any} options={options as any} plugins={[hoverLinePlugin as any]} />
      </div>

      {/* Disability income diagram */}
      <div className="mt-10">
        <DisabilityIncomeDiagram
          initialSalary={rootData?.step_1_data?.currentGrossIncome ?? 4000}
          initialNetSalary={rootData?.step_1_data?.currentNetIncome}
          disabilityPensionNetAmount={rootData?.step_3_data?.disabilityPensionAmount ?? undefined}
        />
      </div>
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
  tone?: "destructive" | "warning";
}) {
  const valueColor =
    tone === "destructive"
      ? "text-destructive"
      : tone === "warning"
        ? "text-[color-mix(in_oklch,var(--warning)_85%,var(--foreground))]"
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

/** Build pension data from frontend fields when the backend call is unavailable. */
function createFallbackPensionData(data: Rentencheck, desiredPension: number): PensionData {
  const currentAge = data.step_2_data?.currentAge || 30;
  const retirementAge = data.step_2_data?.retirementAge || 67;
  const lifeExpectancy = 85;

  const fallbackParameters = {
    economic_assumptions: { inflation_rate: 2.0, investment_return_rate: 3.0 },
    social_insurance: {
      health_insurance_rate: 7.3,
      care_insurance_rate: 3.6,
      total_insurance_rate: 12.15,
    },
  };

  const statutoryPensionGross = 800;
  const statutoryPensionAfterInsurance =
    statutoryPensionGross * (1 - fallbackParameters.social_insurance.total_insurance_rate / 100);
  const privatePensionToday = 200;
  const bavRiesterToday = 150;
  const totalAvailable = statutoryPensionAfterInsurance + privatePensionToday + bavRiesterToday;

  return {
    currentAge,
    retirementAge,
    lifeExpectancy,
    inflationRate: fallbackParameters.economic_assumptions.inflation_rate,
    statutoryPensionGross,
    statutoryPensionAfterInsurance,
    privatePensionToday,
    bavRiesterToday,
    currentPensionGap: Math.max(0, desiredPension - totalAvailable),
    parameters: fallbackParameters,
    isBackendCalculation: false,
  };
}
