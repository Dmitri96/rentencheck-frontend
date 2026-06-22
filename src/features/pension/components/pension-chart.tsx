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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Berechnung mit aktuellen Admin-Parametern...</p>
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
        className={`p-4 rounded-lg border mb-6 ${isBackendCalculation ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}`}
      >
        <h3
          className={`text-lg font-semibold mb-2 ${isBackendCalculation ? "text-green-800" : "text-yellow-800"}`}
        >
          {isBackendCalculation
            ? "✅ Backend-Berechnung mit dynamischen Admin-Parametern"
            : "⚠️ Fallback-Berechnung (Frontend)"}
        </h3>
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <span className="block font-medium">Inflation:</span>
              <span>{parameters.economic_assumptions.inflation_rate}%</span>
            </div>
            <div>
              <span className="block font-medium">Krankenversicherung:</span>
              <span>{parameters.social_insurance.health_insurance_rate}%</span>
            </div>
            <div>
              <span className="block font-medium">Pflegeversicherung:</span>
              <span>{parameters.social_insurance.care_insurance_rate}%</span>
            </div>
            <div>
              <span className="block font-medium">Kapitalrendite:</span>
              <span>{parameters.economic_assumptions.investment_return_rate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border p-4 bg-white">
          <div className="text-sm text-gray-600 mb-1">Gesamtlücke im Ruhestand</div>
          <div className="text-2xl font-bold text-red-600">{formatNumber(totalGap)}</div>
          <div className="text-xs text-gray-500 mt-1">
            Summe aller Ruhestandsjahre, 12 Monate pro Jahr
          </div>
        </div>
        <div className="rounded-xl border p-4 bg-white">
          <div className="text-sm text-gray-600 mb-1">Monatliche Lücke zum Rentenbeginn</div>
          <div className="text-2xl font-bold text-orange-600">
            {formatNumber(monthlyGapAtRetirement)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Monatlicher Fehlbetrag mit {retirementAge} Jahren
          </div>
        </div>
        <div className="rounded-xl border p-4 bg-white">
          <div className="text-sm text-gray-600 mb-1">
            Gesamte monatliche Einnahmen zum Rentenbeginn
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {formatNumber(totalIncomeAtRetirement)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Alle Einkommensquellen kombiniert</div>
        </div>
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
