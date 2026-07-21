"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import type { PensionAnalysis } from "../hooks/use-pension-analysis";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/**
 * Income stages for illness / disability (MVP Zeichnung 2), all NET values
 * computed by the backend engine: Nettogehalt → Krankengeld → volle/halbe
 * EM-Rente → EM-Rente plus private BU-Rente.
 *
 * The private BU input is a local what-if on top of the engine values so the
 * advisor can demonstrate the effect of different coverage amounts.
 */
export function DisabilityIncomeDiagram({
  disability,
}: {
  disability: PensionAnalysis["disability"];
}) {
  const [privateBu, setPrivateBu] = useState(disability.private_disability_pension);

  const bars = [
    { label: "Nettogehalt", value: disability.net_income, color: "oklch(0.32 0.075 260)" },
    {
      label: ["Krankengeld", "(Wo. 7–78)"],
      value: disability.sick_pay,
      color: "oklch(0.65 0.13 65)",
    },
    {
      label: ["Volle EM-Rente", "(netto)"],
      value: disability.emr_full_net,
      color: "oklch(0.52 0.18 25)",
    },
    {
      label: ["Halbe EM-Rente", "(netto)"],
      value: disability.emr_half_net,
      color: "oklch(0.62 0.14 25)",
    },
    {
      label: ["EM-Rente +", "private BU"],
      value: disability.emr_full_net + privateBu,
      color: "oklch(0.5 0.1 155)",
    },
  ];

  const chartData = {
    labels: bars.map((b) => b.label),
    datasets: [
      {
        label: "Netto verfügbar (mtl.)",
        data: bars.map((b) => Math.round(b.value)),
        backgroundColor: bars.map((b) => b.color),
        borderWidth: 0,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: { color: "oklch(0.22 0.025 260)", font: { size: 12 } },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        suggestedMax: Math.max(disability.net_income, disability.emr_full_net + privateBu) * 1.1,
        ticks: {
          callback: (value) => "€" + Number(value).toLocaleString("de-DE"),
          color: "oklch(0.42 0.022 260)",
        },
        grid: { color: "oklch(0.9 0.008 80)" },
      },
    },
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Einkommensverlauf bei längerer Krankheit / Erwerbsminderung (netto)",
        font: { size: 16, weight: "normal" },
        color: "oklch(0.22 0.025 260)",
      },
      tooltip: {
        callbacks: {
          label: (context) => `Netto: €${(context.parsed.y ?? 0).toLocaleString("de-DE")}`,
        },
      },
    },
  };

  const gapWithoutBu = Math.max(0, disability.net_income - disability.emr_full_net);

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">
            Situation längere Krankheit / Berufs- oder Erwerbsunfähigkeit
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Krankengeld: 70 % vom Brutto, höchstens 90 % vom Netto (gedeckelt auf die
            Beitragsbemessungsgrenze). Die EM-Rente wird wie die gesetzliche Rente versteuert und
            verbeitragt.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="insurance">Private BU-Rente (Was-wäre-wenn, mtl. €)</Label>
              <Input
                id="insurance"
                type="number"
                min={0}
                value={privateBu}
                onChange={(e) => setPrivateBu(Math.max(0, Number(e.target.value)))}
                className="text-lg"
              />
            </div>
            <p className="md:col-span-2 text-sm text-muted-foreground">
              Ohne private Absicherung fehlen bei voller Erwerbsminderung monatlich{" "}
              <span className="font-medium text-destructive">
                €{Math.round(gapWithoutBu).toLocaleString("de-DE")}
              </span>{" "}
              gegenüber dem heutigen Netto.
            </p>
          </div>

          {/* Chart */}
          <div className="h-96 w-full">
            <Bar data={chartData} options={options} />
          </div>

          {/* Timeline */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">Zeitlicher Ablauf</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <TimelineStep
                  n={1}
                  title="Erste 6 Wochen"
                  body="Arbeitgeber zahlt 100 % Gehalt (Entgeltfortzahlung)."
                />
                <TimelineStep
                  n={2}
                  title="Woche 7 bis 78"
                  body="Krankengeld der GKV: 70 % vom Brutto, max. 90 % vom Netto."
                />
                <TimelineStep
                  n={3}
                  title="Nach 78 Wochen"
                  body="Kein Krankengeld mehr — Erwerbsminderungsrente (frühestens nach 6 Monaten Antragsverfahren) oder private BU-Rente."
                />
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}

function TimelineStep({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="flex items-center space-x-4">
      <div className="w-8 h-8 rounded-full bg-chart-1 text-primary-foreground flex items-center justify-center text-sm font-bold">
        {n}
      </div>
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-sm text-muted-foreground">{body}</div>
      </div>
    </div>
  );
}
