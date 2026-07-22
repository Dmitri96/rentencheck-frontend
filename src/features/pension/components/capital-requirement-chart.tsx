"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import annotationPlugin from "chartjs-plugin-annotation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PensionAnalysis } from "../hooks/use-pension-analysis";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  annotationPlugin,
);

const eur = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

/**
 * Capital requirement chart (MVP Bild 3): the monthly gap grows with
 * inflation until retirement, then the shaded area shows the total pension
 * payments the client must self-finance and the capital required at
 * retirement start. All figures come from the engine's `gap`/`capital` blocks.
 */
export function CapitalRequirementChart({ analysis }: { analysis: PensionAnalysis }) {
  const { currentAge, retirementAge, provisionEndAge, inflationRate, gap, capital } = analysis;

  // Render whenever a shortfall exists in ANY retirement year — a pension that
  // covers the need at 67 can still fall short later as fixed payouts lose
  // ground to inflation, so keying off the first-year gap would hide it.
  if (!gap.has_gap) {
    return null;
  }

  const endAge = Math.max(provisionEndAge, retirementAge);
  const years = Array.from({ length: endAge - currentAge + 1 }, (_, i) => currentAge + i);

  // Actual per-year shortfall from the engine (no pension income before
  // retirement, so the gap is 0 there). Ages beyond the projection reuse the
  // last known gap so the curve does not dip at the final label.
  const gapByAge = new Map(analysis.retirement_projection.map((p) => [p.age, p.gap]));
  const lastGap = analysis.retirement_projection.at(-1)?.gap ?? 0;
  const gapSeries = years.map((age) => {
    if (age < retirementAge) return 0;
    return Math.round(gapByAge.get(age) ?? lastGap);
  });
  const retirementIndex = years.indexOf(retirementAge);

  const chartData = {
    labels: years,
    datasets: [
      {
        label: "Monatliche Lücke (mit Inflation)",
        data: gapSeries,
        borderColor: "rgba(220, 38, 38, 1)",
        backgroundColor: (ctx: any) => {
          // Shade only the retirement phase (the payments the capital must cover).
          const index = ctx?.p0DataIndex ?? 0;
          return index >= retirementIndex ? "rgba(220, 38, 38, 0.15)" : "rgba(0,0,0,0)";
        },
        fill: "origin" as const,
        segment: {
          backgroundColor: (ctx: any) =>
            ctx.p0DataIndex >= retirementIndex ? "rgba(220, 38, 38, 0.15)" : "rgba(0,0,0,0)",
        },
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.1,
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items: any[]) => `Alter ${items?.[0]?.label}`,
          label: (ctx: any) => `Lücke: €${Number(ctx.parsed.y).toLocaleString("de-DE")} / Monat`,
        },
      },
      annotation: {
        annotations: {
          retirementLine: {
            type: "line",
            xMin: retirementIndex,
            xMax: retirementIndex,
            borderColor: "rgba(17, 24, 39, 0.6)",
            borderWidth: 2,
            borderDash: [5, 5] as number[],
            label: {
              display: true,
              content: `Rentenbeginn ${retirementAge}`,
              position: "start",
              backgroundColor: "rgba(17, 24, 39, 0.8)",
              color: "white",
            },
          },
          paymentsLabel: {
            type: "label",
            xValue: Math.floor((retirementIndex + years.length - 1) / 2),
            yValue: Math.max(...gapSeries) * 0.45,
            content: [
              `Rentenzahlungen: ${eur.format(capital.total_payments)}`,
              `Notwendiges Kapital: ${eur.format(capital.required_capital)}`,
            ],
            backgroundColor: "rgba(255,255,255,0.9)",
            color: "rgba(17,24,39,1)",
            padding: 8,
            borderRadius: 4,
          },
        },
      },
    },
    scales: {
      x: { title: { display: true, text: "Lebensalter" } },
      y: {
        title: { display: true, text: "Monatliche Lücke (€)" },
        ticks: { callback: (v: any) => "€" + Number(v).toLocaleString("de-DE") },
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kapitalbedarf zur Schließung der Lücke</CardTitle>
        <CardDescription>
          {gap.first_gap_age !== null && gap.first_gap_age > retirementAge
            ? `Ihre Versorgung reicht zunächst aus; ab Alter ${gap.first_gap_age} entsteht bei ${inflationRate.toLocaleString("de-DE")} % Inflation eine Lücke, die bis zum Alter ${provisionEndAge} auf ${eur.format(gap.monthly_at_end)} pro Monat wächst.`
            : `Ihre monatliche Lücke wächst mit ${inflationRate.toLocaleString("de-DE")} % Inflation von ${eur.format(gap.monthly_at_retirement)} bei Rentenbeginn auf ${eur.format(gap.monthly_at_end)} mit ${provisionEndAge} Jahren.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full mb-6">
          <Line data={chartData} options={options} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <CapitalFact
            label={`Gesamte Kapitalzahlungen über ${capital.years} Jahre Rentenzeit`}
            value={eur.format(capital.total_payments)}
          />
          <CapitalFact
            label={`Notwendiges Rentenkapital zum Rentenbeginn (bei ${analysis.parameters_used.economic_assumptions.investment_return_rate.toLocaleString("de-DE")} % Rendite)`}
            value={eur.format(capital.required_capital)}
            strong
          />
          <CapitalFact
            label={`Verbleibendes Restkapital mit ${provisionEndAge} Jahren`}
            value={eur.format(capital.remaining_capital)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function CapitalFact({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-md border border-border px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`mt-1 font-mono tabular-nums currency ${strong ? "text-destructive font-semibold text-lg" : "text-foreground"}`}
      >
        {value}
      </p>
    </div>
  );
}
