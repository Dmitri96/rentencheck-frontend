"use client";

import { useEffect, useState } from "react";
import { animate } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowDownRight, ArrowUpRight, CircleCheck, TriangleAlert } from "lucide-react";
import type { PensionAnalysis } from "../hooks/use-pension-analysis";
import { PensionBreakdownTable } from "./pension-breakdown-table";

const eurFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

/**
 * Pension results — hero gap KPI, tiles and the Bild-0 breakdown table.
 *
 * Renders the backend analysis verbatim: the hero, the tiles and the table
 * footer all show the SAME gap figures from the engine.
 */
export function PensionResultsOverview({ analysis }: { analysis: PensionAnalysis }) {
  const pensionGap = analysis.gap.monthly_today;
  const availablePension =
    analysis.totals.purchasing_power - analysis.private_health_insurance.purchasing_power;
  const isCovered = pensionGap === 0;

  // Hero count-up: animates from 0 to final on mount, single moment of theatre.
  const [animatedGap, setAnimatedGap] = useState(0);
  useEffect(() => {
    const controls = animate(0, pensionGap, {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setAnimatedGap(v),
    });
    return () => controls.stop();
  }, [pensionGap]);

  return (
    <div className="space-y-12">
      {/* Hero KPI */}
      <section className="text-center pt-4">
        <p className="label-uppercase mb-3">Monatliche Versorgungslücke</p>
        <p className="kpi-display text-foreground">{eurFormatter.format(animatedGap)}</p>
        <p className="mt-4 max-w-xl mx-auto text-muted-foreground text-[1.0625rem] leading-relaxed">
          {isCovered ? (
            <>
              Ihre erwartete Rente deckt den Rentenwunsch vollständig. Sie sind im{" "}
              <span className="text-success font-medium">grünen Bereich</span>.
            </>
          ) : (
            <>
              Differenz zwischen Rentenwunsch und kaufkraftbereinigter Netto-Rente. Um die Lücke bis
              Alter {analysis.provisionEndAge} zu schließen, benötigen Sie zum Rentenbeginn ein
              Kapital von{" "}
              <span className="text-foreground font-medium currency">
                {eurFormatter.format(analysis.capital.required_capital)}
              </span>
              .
            </>
          )}
        </p>
      </section>

      {/* KPI grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiTile
          label="Rentenwunsch"
          value={analysis.desired_pension.today}
          icon={<ArrowUpRight className="h-4 w-4" />}
        />
        <KpiTile
          label="Verfügbare Rente (Kaufkraft)"
          value={availablePension}
          accent="success"
          icon={<CircleCheck className="h-4 w-4 text-success" />}
        />
        <KpiTile
          label="Versorgungslücke"
          value={pensionGap}
          accent={isCovered ? "success" : "destructive"}
          icon={
            isCovered ? (
              <CircleCheck className="h-4 w-4 text-success" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-destructive" />
            )
          }
        />
      </div>

      {/* Status pill */}
      <div className="flex justify-center">
        {isCovered ? (
          <Badge variant="success">Vollständig abgedeckt</Badge>
        ) : (
          <Badge variant="destructive">{eurFormatter.format(pensionGap)} monatlich offen</Badge>
        )}
      </div>

      {/* Breakdown table */}
      <Card>
        <CardHeader>
          <CardTitle>Berechnungsergebnisse</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Alle Beträge sind monatliche Werte zum Rentenbeginn; die Kaufkraft ist auf heutige
            Preise abgezinst ({analysis.inflationRate.toLocaleString("de-DE")} % Inflation p. a.).
          </p>
        </CardHeader>
        <CardContent className="px-0">
          <PensionBreakdownTable analysis={analysis} />
        </CardContent>
      </Card>

      {/* Recommendations */}
      {pensionGap > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TriangleAlert className="h-4 w-4 text-[color-mix(in_oklch,var(--warning)_85%,var(--foreground))]" />
              <CardTitle>Empfehlungen zur Schließung der Versorgungslücke</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Separator className="mb-5" />
            <ul className="space-y-4 text-sm text-foreground">
              <Recommendation
                heading="Erhöhung der privaten Altersvorsorge"
                body="Zusätzliche monatliche Einzahlungen in private Rentenversicherungen oder Fondssparpläne."
              />
              <Recommendation
                heading="Betriebliche Altersvorsorge"
                body="Maximierung der betrieblichen Vorsorge durch Entgeltumwandlung oder Arbeitgeberzuschüsse."
              />
              <Recommendation
                heading="Riester-Rente"
                body="Nutzung staatlicher Förderungen für zusätzliche Rentenerträge."
              />
              <Recommendation
                heading="Immobilieninvestments"
                body="Aufbau von Mieteinnahmen zur Ergänzung der Altersrente."
              />
            </ul>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-[var(--ink-tertiary)] text-center">
        Alle Berechnungen sind Schätzungen auf Basis der hinterlegten Referenzwerte. Individuelle
        steuerliche und versicherungsrechtliche Faktoren sind in der detaillierten Planung zu
        berücksichtigen.
      </p>
    </div>
  );
}

function KpiTile({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: number;
  accent?: "success" | "destructive";
  icon?: React.ReactNode;
}) {
  const valueColor =
    accent === "success"
      ? "text-success"
      : accent === "destructive"
        ? "text-destructive"
        : "text-foreground";
  return (
    <Card data-elevated="true">
      <CardContent className="px-6 py-5">
        <div className="flex items-center justify-between">
          <p className="label-uppercase">{label}</p>
          <span className="text-[var(--ink-tertiary)]">{icon}</span>
        </div>
        <p
          className={`mt-3 text-[1.75rem] leading-none currency ${valueColor}`}
          style={{ fontFamily: "var(--font-display), Georgia, serif", fontWeight: 500 }}
        >
          {eurFormatter.format(value)}
        </p>
      </CardContent>
    </Card>
  );
}

function Recommendation({ heading, body }: { heading: string; body: string }) {
  return (
    <li className="flex items-start gap-3">
      <span
        aria-hidden
        className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[color-mix(in_oklch,var(--warning)_85%,var(--foreground))] shrink-0"
      />
      <div>
        <strong className="text-foreground font-medium">{heading}:</strong>{" "}
        <span className="text-muted-foreground">{body}</span>
      </div>
    </li>
  );
}
