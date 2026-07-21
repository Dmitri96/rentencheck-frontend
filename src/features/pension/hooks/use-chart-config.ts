/**
 * Derives chart-ready data and Chart.js options from the backend analysis.
 *
 * Comparison basis is consistent: all series are NET amounts (after tax and
 * KV/PV) in nominal euros per age — the Rentenwunsch line is inflated the
 * same way, so the visual gap at retirement equals the engine's
 * gap.monthly_at_retirement.
 */

import type { PensionAnalysis, PensionAnalysisRow } from "./use-pension-analysis";

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

/** Stacked chart bands follow the engine's stable per-row group id. */
function groupOf(row: PensionAnalysisRow): "statutory" | "bav" | "private" | "other" {
  if (row.group === "statutory") return "statutory";
  if (row.group === "occupational") return "bav";
  if (row.group === "private") return "private";
  return "other";
}

export function useChartConfig(analysis: PensionAnalysis): UseChartConfigResult {
  const { currentAge, retirementAge, provisionEndAge, inflationRate } = analysis;

  const inflation = inflationRate / 100;
  const pensionIncrease =
    (analysis.parameters_used.economic_assumptions.pension_increase_rate ?? 0) / 100;
  const pkvMonthly = analysis.private_health_insurance.monthly_at_retirement;

  const netByGroup = { statutory: 0, bav: 0, private: 0, other: 0 };
  for (const row of analysis.rows) {
    netByGroup[groupOf(row)] += row.after_insurance;
  }

  const endAge = Math.max(provisionEndAge, retirementAge);
  const years = Array.from({ length: endAge - currentAge + 1 }, (_, i) => currentAge + i);

  const series = years.map((age) => {
    const desired = analysis.desired_pension.today * Math.pow(1 + inflation, age - currentAge);

    // No pension income before retirement — the client is still working, so the
    // income bands only appear from the Renteneintritt onward. After retirement
    // the statutory claim grows with the Rentensteigerung, scaled around the
    // retirement value so it matches the engine exactly at retirement age.
    const preRetirement = age < retirementAge;
    const statutory = preRetirement
      ? 0
      : netByGroup.statutory * Math.pow(1 + pensionIncrease, age - retirementAge);
    const bav = preRetirement ? 0 : netByGroup.bav;
    const privatePension = preRetirement ? 0 : netByGroup.private;
    const other = preRetirement ? 0 : netByGroup.other;

    const totalIncome = preRetirement ? 0 : statutory + bav + privatePension + other - pkvMonthly;
    const gap = preRetirement ? 0 : Math.max(0, desired - totalIncome);
    return { age, desired, statutory, bav, privatePension, other, totalIncome, gap };
  });

  const yearlyGapSeries = series.map((d) => d.gap * 12);
  const cumulativeGapSeries = yearlyGapSeries.reduce((acc: number[], val, idx) => {
    const prev = idx > 0 ? (acc[idx - 1] ?? 0) : 0;
    acc[idx] = prev + val;
    return acc;
  }, [] as number[]);

  const retirementIndex = years.indexOf(retirementAge);
  // The headline figure comes from the engine (gap growing with inflation over
  // the whole retirement); the per-age series above is visualization only.
  const totalGap = analysis.capital.total_payments;
  const monthlyGapAtRetirement = analysis.gap.monthly_at_retirement;
  const totalIncomeAtRetirement =
    analysis.totals.after_insurance - analysis.private_health_insurance.monthly_at_retirement;

  const stackedDataset = (label: string, values: number[], color: string, first = false) => ({
    label,
    data: values.map((v) => Math.round(v)),
    backgroundColor: color.replace("1)", "0.8)"),
    borderColor: color,
    borderWidth: 1,
    fill: first ? true : ("-1" as const),
    tension: 0.1,
  });

  const chartData = {
    labels: years,
    datasets: [
      stackedDataset(
        "Gesetzl. Versorgung (netto)",
        series.map((d) => d.statutory),
        "rgba(22, 163, 74, 1)",
        true,
      ),
      stackedDataset(
        "bAV & Zusatzversorgung (netto)",
        series.map((d) => d.statutory + d.bav),
        "rgba(2, 132, 199, 1)",
      ),
      stackedDataset(
        "Private Vorsorge (netto)",
        series.map((d) => d.statutory + d.bav + d.privatePension),
        "rgba(124, 58, 237, 1)",
      ),
      stackedDataset(
        "Weitere Einkünfte (netto)",
        series.map((d) => d.statutory + d.bav + d.privatePension + d.other),
        "rgba(100, 116, 139, 1)",
      ),
      {
        label: "Rentenwunsch (inflationiert)",
        data: series.map((d) => Math.round(d.desired)),
        backgroundColor: "rgba(234, 88, 12, 0.15)",
        borderColor: "rgba(234, 88, 12, 1)",
        borderWidth: 2,
        fill: false,
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
              `Gesamte Netto-Einnahmen: €${Math.round(d.totalIncome).toLocaleString("de-DE")}`,
              `Lücke (monatlich): €${Math.round(d.gap).toLocaleString("de-DE")}`,
            ];
            if (d.age >= retirementAge) {
              lines.push(
                `Lücke pro Jahr: €${Math.round(yearlyGapSeries[i] ?? 0).toLocaleString("de-DE")}`,
                `Kumulierte Lücke bis Alter ${d.age}: €${Math.round(cumulativeGapSeries[i] ?? 0).toLocaleString("de-DE")}`,
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
            content:
              totalGap > 0
                ? `Gesamte Lücke: €${Math.round(totalGap).toLocaleString("de-DE")}`
                : "Keine Versorgungslücke",
            // Green when the desired pension is fully covered, red when a gap remains.
            backgroundColor: totalGap > 0 ? "rgba(220, 38, 38, 0.9)" : "rgba(22, 163, 74, 0.9)",
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
          callback: (value: any) => "€" + Number(value).toLocaleString("de-DE"),
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
