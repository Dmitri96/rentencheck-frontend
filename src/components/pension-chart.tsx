import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Filler } from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import type { Rentencheck } from "@/lib/services/rentencheck-service";
import { DisabilityIncomeDiagram } from "@/components/disability-income-diagram";
import { RentencheckService } from "@/lib/services/rentencheck-service";
import { PensionResultsTable } from "@/components/pension-results-table";

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

interface PensionData {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  inflationRate: number;
  statutoryPensionGross: number;
  statutoryPensionAfterInsurance: number;
  privatePensionToday: number;
  bavRiesterToday: number;
  currentPensionGap: number;
  parameters: {
    economic_assumptions: {
      inflation_rate: number;
      investment_return_rate: number;
      pension_increase_rate?: number;
    };
    social_insurance: {
      health_insurance_rate: number;
      care_insurance_rate: number;
      total_insurance_rate: number;
    };
  };
  isBackendCalculation: boolean;
}

const formatNumber = (value: number) => {
  return `${value.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;
};

/**
 * Hook to fetch pension calculation data from backend using dynamic admin parameters
 */
function usePensionCalculation(clientId?: number, rentencheckId?: number, desiredPension?: number) {
  const [pensionData, setPensionData] = useState<PensionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId || !rentencheckId || !desiredPension) return;

    const fetchCalculation = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await RentencheckService.getPensionCalculation(clientId, rentencheckId);
        const backendData = response.pension_data;

        // Transform backend data to our clean interface
        const cleanData: PensionData = {
          currentAge: backendData.currentAge,
          retirementAge: backendData.retirementAge,
          lifeExpectancy: backendData.lifeExpectancy,
          inflationRate: backendData.inflationRate,
          statutoryPensionGross: backendData.statutoryPensionGross,
          statutoryPensionAfterInsurance: backendData.statutoryPensionAfterInsurance,
          privatePensionToday: backendData.privatePensionToday,
          bavRiesterToday: backendData.bavRiesterToday,
          currentPensionGap: Math.max(
            0,
            desiredPension -
              (backendData.statutoryPensionAfterInsurance +
                backendData.privatePensionToday +
                backendData.bavRiesterToday),
          ),
          parameters: backendData.parameters_used,
          isBackendCalculation: true,
        };

        setPensionData(cleanData);
        console.log(
          "✅ Using Backend Calculation with Dynamic Admin Parameters:",
          cleanData.parameters,
        );
      } catch (err) {
        console.warn("Backend calculation failed, will use fallback:", err);
        setError(err instanceof Error ? err.message : "Unbekannter Fehler");
        setPensionData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCalculation();
  }, [clientId, rentencheckId, desiredPension]);

  return { pensionData, loading, error };
}

export function PensionChart({ data, desiredPension }: PensionChartProps) {
  const clientId = data.client_id;
  const rentencheckId = data.id;

  // Try to get backend calculation data with dynamic parameters
  const { pensionData, loading, error } = usePensionCalculation(
    clientId,
    rentencheckId,
    desiredPension,
  );

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

  if (pensionData) {
    // Render with backend calculation data
    return renderChart(pensionData, desiredPension, data);
  }

  // Fallback: create pension data from frontend
  const fallbackData = createFallbackPensionData(data, desiredPension);
  return renderChart(fallbackData, desiredPension, data);
}

/**
 * Create fallback pension data when backend calculation is not available
 */
function createFallbackPensionData(data: Rentencheck, desiredPension: number): PensionData {
  const currentAge = data.step_2_data?.currentAge || 30;
  const retirementAge = data.step_2_data?.retirementAge || 67;
  const lifeExpectancy = 85; // Realistic German life expectancy

  // Use hardcoded fallback parameters
  const fallbackParameters = {
    economic_assumptions: {
      inflation_rate: 2.0,
      investment_return_rate: 3.0,
    },
    social_insurance: {
      health_insurance_rate: 7.3,
      care_insurance_rate: 3.6,
      total_insurance_rate: 12.15,
    },
  };

  // Simple fallback calculations
  const statutoryPensionGross = 800; // Simplified fallback
  const statutoryPensionAfterInsurance =
    statutoryPensionGross * (1 - fallbackParameters.social_insurance.total_insurance_rate / 100);
  const privatePensionToday = 200; // Simplified fallback
  const bavRiesterToday = 150; // Simplified fallback
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

/**
 * Render the pension chart with calculated data
 */
function renderChart(pensionData: PensionData, desiredPension: number, rootData?: Rentencheck) {
  const {
    currentAge,
    retirementAge,
    lifeExpectancy,
    inflationRate,
    statutoryPensionGross,
    statutoryPensionAfterInsurance,
    privatePensionToday,
    bavRiesterToday,
    currentPensionGap,
    parameters,
    isBackendCalculation,
  } = pensionData;

  const INFLATION_RATE = inflationRate / 100;
  const yearsToRetirement = retirementAge - currentAge;
  const totalAvailablePension =
    statutoryPensionAfterInsurance + privatePensionToday + bavRiesterToday;
  const gapAtRetirement = currentPensionGap * Math.pow(1 + INFLATION_RATE, yearsToRetirement);

  // Generate years array for chart
  const years = Array.from({ length: lifeExpectancy - currentAge + 1 }, (_, i) => currentAge + i);
  // Build per-age series using inflation projection (keeps single source of truth)
  const series = years.map((age) => {
    const yearsFromNow = age - currentAge;
    const desired = desiredPension * Math.pow(1 + INFLATION_RATE, yearsFromNow);

    const pensionIncreaseRate =
      (parameters?.economic_assumptions?.pension_increase_rate ?? 0) / 100;

    // Gesetzliche Rente: ab HEUTE sichtbar (Übersicht wie im Rentenbrief).
    // Basiswert ab aktuellem Alter ist die eingegebene Brutto-Rente (z. B. 3000).
    // Ab jedem Jahr steigt sie um die Rentensteigerungsrate.
    const statutoryAtCurrentAge = statutoryPensionGross;
    const statutory =
      age < currentAge
        ? 0
        : statutoryAtCurrentAge * Math.pow(1 + pensionIncreaseRate, age - currentAge);

    // BAV (neu): Berufsständische Versorgungswerke + Zusatzversorgung öffentlicher Dienst (ab Rentenbeginn, konstant)
    const bavNeuAtRetirement =
      (rootData?.step_3_data?.professionalProvisionAmount || 0) +
      (rootData?.step_3_data?.publicServiceProvisionAmount || 0);
    const bavNeu = age < retirementAge ? 0 : bavNeuAtRetirement;

    // Weitere Einkommen werden nicht separat visualisiert; verbleibende private Einkünfte zur Lückenberechnung
    const otherIncomeAtRetirement = privatePensionToday + bavRiesterToday;
    const otherIncome = age < retirementAge ? 0 : otherIncomeAtRetirement;

    const totalIncome = statutory + bavNeu + otherIncome;
    const gap = Math.max(0, desired - totalIncome);
    return { age, desired, statutory, bavNeu, otherIncome, totalIncome, gap };
  });

  // Yearly and cumulative gap (start cumulation at retirement age)
  const yearlyGapSeries = series.map((d) => (d.age >= retirementAge ? d.gap * 12 : 0));
  const cumulativeGapSeries = yearlyGapSeries.reduce((acc: number[], val, idx) => {
    const prev = idx > 0 ? acc[idx - 1] : 0;
    acc[idx] = prev + val;
    return acc;
  }, [] as number[]);

  const retirementIndex = years.indexOf(retirementAge);
  // Summe der monatlichen Lücke über alle Ruhestandsjahre -> in Jahresäquivalent (12 Monate pro Jahr)
  const totalGap = series
    .filter((d) => d.age >= retirementAge && d.age <= lifeExpectancy)
    .reduce((sum, d) => sum + d.gap * 12, 0);

  // KPIs für Kacheln
  const monthlyGapAtRetirement = retirementIndex >= 0 ? series[retirementIndex].gap : 0;
  const totalIncomeAtRetirement = retirementIndex >= 0 ? series[retirementIndex].totalIncome : 0;

  // Chart data configuration (stacked cumulative areas like the new Chart.js demo)
  const chartData = {
    labels: years,
    datasets: [
      {
        label: "Gesetzliche Rente",
        data: series.map((d) => Math.round(d.statutory)),
        backgroundColor: "rgba(22, 163, 74, 0.8)",
        borderColor: "rgba(22, 163, 74, 1)",
        borderWidth: 1,
        fill: true,
        tension: 0.1,
      },
      {
        label: "BAV (neu)",
        data: series.map((d) => Math.round(d.statutory + d.bavNeu)),
        backgroundColor: "rgba(2, 132, 199, 0.8)",
        borderColor: "rgba(2, 132, 199, 1)",
        borderWidth: 1,
        fill: "-1" as const,
        tension: 0.1,
      },
      {
        label: "Rentenwunsch",
        data: series.map((d) => Math.round(d.desired)),
        backgroundColor: "rgba(234, 88, 12, 0.8)",
        borderColor: "rgba(234, 88, 12, 1)",
        borderWidth: 2,
        fill: "-1" as const,
        tension: 0.1,
      },
    ],
  };

  // Custom hover ruler plugin: draws a thin vertical line at the hovered x position
  const hoverLinePlugin = {
    id: "hoverLine",
    afterDatasetsDraw(chart: any) {
      const { ctx } = chart;
      const active = chart.getActiveElements?.() || [];
      if (!active.length) return;
      const x = active[0].element?.x;
      const chartArea = chart.chartArea;
      if (x == null || !chartArea) return;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, chartArea.top);
      ctx.lineTo(x, chartArea.bottom);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.restore();
    },
  };

  // Chart options
  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false, axis: "x" },
    elements: {
      point: {
        radius: 2,
        hoverRadius: 6,
        hitRadius: 10,
      },
      line: {
        borderWidth: 2,
      },
    },
    plugins: {
      legend: { position: "top" },
      title: { display: false },
      tooltip: {
        mode: "index",
        intersect: false,
        displayColors: true,
        backgroundColor: "rgba(17,24,39,0.9)",
        borderColor: "rgba(0,0,0,0.1)",
        borderWidth: 1,
        padding: 10,
        titleFont: { weight: "600" },
        callbacks: {
          title: (items: any[]) => {
            const age = items?.[0]?.label;
            return `Alter ${age}`;
          },
          afterBody: (context: any) => {
            const i = context[0].dataIndex;
            const d = series[i];
            const lines = [
              `Gesamte Einnahmen: €${Math.round(d.totalIncome).toLocaleString()}`,
              `Lücke (monatlich): €${Math.round(d.gap).toLocaleString()}`,
            ];
            if (d.age >= retirementAge) {
              const yearlyGap = Math.round(yearlyGapSeries[i]);
              const cumGap = Math.round(cumulativeGapSeries[i]);
              lines.push(`Lücke pro Jahr: €${yearlyGap.toLocaleString()}`);
              lines.push(`Kumulierte Lücke bis Alter ${d.age}: €${cumGap.toLocaleString()}`);
            }
            return lines;
          },
        },
      },
      annotation: {
        annotations: {
          retirementLine: {
            type: "line",
            xMin: retirementIndex,
            xMax: retirementIndex,
            borderColor: "rgba(220, 38, 38, 0.8)",
            borderWidth: 3,
            borderDash: [5, 5] as number[],
            label: {
              display: true,
              content: "Renteneintritt",
              position: "start",
              backgroundColor: "rgba(220, 38, 38, 0.8)",
              color: "white",
            },
          },
          gapLabel: {
            type: "label",
            xValue: Math.floor((retirementIndex + years.length) / 2),
            yValue: Math.max(...series.map((d) => d.desired)) * 0.7,
            content: `Gesamte Lücke: €${Math.round(totalGap).toLocaleString()}`,
            backgroundColor: "rgba(220, 38, 38, 0.9)",
            color: "white",
            padding: 8,
            borderRadius: 4,
          },
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Alter" },
      },
      y: {
        title: { display: true, text: "Monatlicher Betrag (€)" },
        ticks: {
          callback: (value: any) => "€" + Number(value).toLocaleString(),
        },
      },
    },
  };
  // No custom canvas plugins needed; using annotation plugin for lines/labels

  return (
    <div className="w-full">
      {/* Calculation Source Indicator */}
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

      {/* KPI-Kacheln */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border p-4 bg-white">
          let
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

      {/* Chart Container */}
      <div className="w-full mb-8" style={{ height: "500px", padding: "20px" }}>
        <Line data={chartData} options={options} plugins={[hoverLinePlugin]} />
      </div>

      {/* Berufsunfähigkeits-Diagramm */}
      <div className="mt-10">
        <DisabilityIncomeDiagram
          initialSalary={rootData?.step_1_data?.currentGrossIncome ?? 4000}
          initialNetSalary={rootData?.step_1_data?.currentNetIncome}
          disabilityPensionNetAmount={rootData?.step_3_data?.disabilityPensionAmount ?? undefined}
        />
      </div>

      {/* Analysis Table is handled by separate PensionResultsTable component elsewhere */}

      {/* Gap analysis boxes removed to keep single source of truth in table */}

      {/* Note box removed to reduce duplication and keep layout clean */}
    </div>
  );
}
