/**
 * Derives all chart-ready data and Chart.js options from raw pension calculation data.
 *
 * Extracted from pension-chart.tsx to keep the render component thin. All the
 * series math, KPI values, annotation placement, and option objects live here.
 */

import type { Rentencheck } from "@/lib/services/rentencheck-service";
import type { PensionData } from "@/features/pension";

type AnyObject = Record<string, any>;

interface UseChartConfigResult {
  years: number[];
  chartData: AnyObject;
  options: AnyObject;
  hoverLinePlugin: AnyObject;
  totalGap: number;
  monthlyGapAtRetirement: number;
  totalIncomeAtRetirement: number;
  retirementIndex: number;
}

/**
 * Computes chart series, KPI tiles, and Chart.js config from pension calculation output.
 */
export function useChartConfig(
  pensionData: PensionData,
  desiredPension: number,
  rootData?: Rentencheck,
): UseChartConfigResult {
  const {
    currentAge,
    retirementAge,
    lifeExpectancy,
    inflationRate,
    statutoryPensionGross,
    privatePensionToday,
    bavRiesterToday,
    parameters,
  } = pensionData;

  const INFLATION_RATE = inflationRate / 100;

  const years = Array.from({ length: lifeExpectancy - currentAge + 1 }, (_, i) => currentAge + i);

  const series = years.map((age) => {
    const yearsFromNow = age - currentAge;
    const desired = desiredPension * Math.pow(1 + INFLATION_RATE, yearsFromNow);

    const pensionIncreaseRate =
      (parameters?.economic_assumptions?.pension_increase_rate ?? 0) / 100;

    const statutory =
      age < currentAge
        ? 0
        : statutoryPensionGross * Math.pow(1 + pensionIncreaseRate, age - currentAge);

    const bavNeuAtRetirement =
      (rootData?.step_3_data?.professionalProvisionAmount || 0) +
      (rootData?.step_3_data?.publicServiceProvisionAmount || 0);
    const bavNeu = age < retirementAge ? 0 : bavNeuAtRetirement;

    const otherIncomeAtRetirement = privatePensionToday + bavRiesterToday;
    const otherIncome = age < retirementAge ? 0 : otherIncomeAtRetirement;

    const totalIncome = statutory + bavNeu + otherIncome;
    const gap = Math.max(0, desired - totalIncome);
    return { age, desired, statutory, bavNeu, otherIncome, totalIncome, gap };
  });

  const yearlyGapSeries = series.map((d) => (d.age >= retirementAge ? d.gap * 12 : 0));
  const cumulativeGapSeries = yearlyGapSeries.reduce((acc: number[], val, idx) => {
    const prev = idx > 0 ? (acc[idx - 1] ?? 0) : 0;
    acc[idx] = prev + val;
    return acc;
  }, [] as number[]);

  const retirementIndex = years.indexOf(retirementAge);

  const totalGap = series
    .filter((d) => d.age >= retirementAge && d.age <= lifeExpectancy)
    .reduce((sum, d) => sum + d.gap * 12, 0);

  const monthlyGapAtRetirement = retirementIndex >= 0 ? (series[retirementIndex]?.gap ?? 0) : 0;
  const totalIncomeAtRetirement =
    retirementIndex >= 0 ? (series[retirementIndex]?.totalIncome ?? 0) : 0;

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

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false, axis: "x" },
    elements: {
      point: { radius: 2, hoverRadius: 6, hitRadius: 10 },
      line: { borderWidth: 2 },
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
          title: (items: any[]) => `Alter ${items?.[0]?.label}`,

          afterBody: (context: any) => {
            const i = context[0].dataIndex;
            const d = series[i];
            if (!d) return [];
            const lines = [
              `Gesamte Einnahmen: €${Math.round(d.totalIncome).toLocaleString()}`,
              `Lücke (monatlich): €${Math.round(d.gap).toLocaleString()}`,
            ];
            if (d.age >= retirementAge) {
              lines.push(
                `Lücke pro Jahr: €${Math.round(yearlyGapSeries[i] ?? 0).toLocaleString()}`,
              );
              lines.push(
                `Kumulierte Lücke bis Alter ${d.age}: €${Math.round(cumulativeGapSeries[i] ?? 0).toLocaleString()}`,
              );
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
      x: { title: { display: true, text: "Alter" } },
      y: {
        title: { display: true, text: "Monatlicher Betrag (€)" },
        ticks: {
          callback: (value: any) => "€" + Number(value).toLocaleString(),
        },
      },
    },
  };

  return {
    years,
    chartData,
    options,
    hoverLinePlugin,
    totalGap,
    monthlyGapAtRetirement,
    totalIncomeAtRetirement,
    retirementIndex,
  };
}
