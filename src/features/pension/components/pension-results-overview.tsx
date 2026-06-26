"use client";

import { useEffect, useState } from "react";
import { animate } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowDownRight, ArrowUpRight, CircleCheck, TriangleAlert } from "lucide-react";
import type { Rentencheck } from "@/lib/services/rentencheck-service";
import { aggregateIncomeSources } from "../utils/income-aggregator";

interface PensionResultsOverviewProps {
  data: Rentencheck;
  desiredPension: number;
}

// German tax + cost-of-living defaults — match the prior implementation.
const TAX_RATE = 0.42;
const CHURCH_TAX_RATE = 0.09;
const SOLIDARITY_TAX_RATE = 0.055;
const HEALTH_INSURANCE_RATE = 0.073;
const INFLATION_RATE = 0.02;

const eurFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const eurPreciseFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function fmtPrecise(amount: number, showSign = false) {
  const sign = showSign && amount !== 0 ? (amount > 0 ? "+" : "−") : "";
  return `${sign}${eurPreciseFormatter.format(Math.abs(amount))}`;
}

/**
 * Pension results — the moneymaker.
 *
 * Hero: a single Fraunces KPI showing the monthly gap (or 0 when covered).
 * Count-up animates once on mount (`--duration-slowest`). Three KPI tiles
 * below give the Rentenwunsch / Verfügbar / Gap breakdown, then the
 * breakdown table, then the recommendation pull-quote.
 */
export function PensionResultsOverview({ data, desiredPension }: PensionResultsOverviewProps) {
  const calculateNetAmounts = (grossAmount: number) => {
    const incomeTax = grossAmount * TAX_RATE;
    const churchTax = incomeTax * CHURCH_TAX_RATE;
    const solidarityTax = incomeTax * SOLIDARITY_TAX_RATE;
    const afterTax = grossAmount - incomeTax - churchTax - solidarityTax;
    const healthInsurance = grossAmount * HEALTH_INSURANCE_RATE;
    const afterHealthInsurance = afterTax - healthInsurance;
    const purchasingPower = afterHealthInsurance / (1 + INFLATION_RATE);
    return {
      grossAmount,
      incomeTax,
      churchTax,
      solidarityTax,
      afterTax,
      healthInsurance,
      afterHealthInsurance,
      purchasingPower,
    };
  };

  const incomeData = aggregateIncomeSources(data.step_3_data ?? null).map(
    ({ label, monthlyGross }) => ({
      source: label,
      ...calculateNetAmounts(monthlyGross),
    }),
  );

  const totals = incomeData.reduce(
    (acc, row) => ({
      grossAmount: acc.grossAmount + row.grossAmount,
      incomeTax: acc.incomeTax + row.incomeTax,
      churchTax: acc.churchTax + row.churchTax,
      solidarityTax: acc.solidarityTax + row.solidarityTax,
      afterTax: acc.afterTax + row.afterTax,
      healthInsurance: acc.healthInsurance + row.healthInsurance,
      afterHealthInsurance: acc.afterHealthInsurance + row.afterHealthInsurance,
      purchasingPower: acc.purchasingPower + row.purchasingPower,
    }),
    {
      grossAmount: 0,
      incomeTax: 0,
      churchTax: 0,
      solidarityTax: 0,
      afterTax: 0,
      healthInsurance: 0,
      afterHealthInsurance: 0,
      purchasingPower: 0,
    },
  );

  const pensionGap = Math.max(0, desiredPension - totals.purchasingPower);
  const additionalCapitalNeeded = pensionGap * 12 * 20;
  const inflationAdjustedCapital = additionalCapitalNeeded * Math.pow(1 + INFLATION_RATE, 20);

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
              Differenz zwischen Rentenwunsch und kaufkraftbereinigter Rente. Über 20 Jahre
              entspricht das einem Kapitalbedarf von{" "}
              <span className="text-foreground font-medium currency">
                {eurFormatter.format(inflationAdjustedCapital)}
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
          value={desiredPension}
          icon={<ArrowUpRight className="h-4 w-4" />}
        />
        <KpiTile
          label="Verfügbare Rente"
          value={totals.purchasingPower}
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
          <Badge variant="destructive">{fmtPrecise(pensionGap)} monatlich offen</Badge>
        )}
      </div>

      {/* Breakdown table */}
      <Card>
        <CardHeader>
          <CardTitle>Berechnungsergebnisse</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Alle Beträge sind monatliche Werte. Die Kaufkraft berücksichtigt 2 % Inflation p. a.
          </p>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle">
                  <Th align="left">Einkommensquelle</Th>
                  <Th>Brutto</Th>
                  <Th>Steuer</Th>
                  <Th>Kirche</Th>
                  <Th>Soli</Th>
                  <Th>Nach Steuer</Th>
                  <Th>KV</Th>
                  <Th>Nach KV</Th>
                  <Th>Kaufkraft</Th>
                </tr>
              </thead>
              <tbody className="[&_tr:nth-child(even)]:bg-[var(--surface-subtle)]">
                {incomeData.map((row, index) => (
                  <tr key={index}>
                    <Td align="left" strong>
                      {row.source}
                    </Td>
                    <Td>{fmtPrecise(row.grossAmount)}</Td>
                    <Td tone="muted">{fmtPrecise(row.incomeTax)}</Td>
                    <Td tone="muted">{fmtPrecise(row.churchTax)}</Td>
                    <Td tone="muted">{fmtPrecise(row.solidarityTax)}</Td>
                    <Td>{fmtPrecise(row.afterTax)}</Td>
                    <Td tone="muted">{fmtPrecise(row.healthInsurance)}</Td>
                    <Td tone="success">{fmtPrecise(row.afterHealthInsurance)}</Td>
                    <Td tone="success" strong>
                      {fmtPrecise(row.purchasingPower)}
                    </Td>
                  </tr>
                ))}

                <tr className="border-t border-foreground/20 bg-muted">
                  <Td align="left" strong>
                    Gesamt
                  </Td>
                  <Td strong>{fmtPrecise(totals.grossAmount)}</Td>
                  <Td tone="muted">{fmtPrecise(totals.incomeTax)}</Td>
                  <Td tone="muted">{fmtPrecise(totals.churchTax)}</Td>
                  <Td tone="muted">{fmtPrecise(totals.solidarityTax)}</Td>
                  <Td strong>{fmtPrecise(totals.afterTax)}</Td>
                  <Td tone="muted">{fmtPrecise(totals.healthInsurance)}</Td>
                  <Td tone="success" strong>
                    {fmtPrecise(totals.afterHealthInsurance)}
                  </Td>
                  <Td tone="success" strong>
                    {fmtPrecise(totals.purchasingPower)}
                  </Td>
                </tr>
              </tbody>
            </table>
          </div>
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
        Alle Berechnungen sind Schätzungen. Individuelle Faktoren wie Steuern, Inflation und
        Versicherungsleistungen sind in der detaillierten Planung zu berücksichtigen.
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

function Th({
  children,
  align = "right",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th className={`label-uppercase px-3 py-3 ${align === "right" ? "text-right" : "text-left"}`}>
      {children}
    </th>
  );
}

function Td({
  children,
  align = "right",
  strong = false,
  tone,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  strong?: boolean;
  tone?: "muted" | "success";
}) {
  const color =
    tone === "muted"
      ? "text-muted-foreground"
      : tone === "success"
        ? "text-success"
        : "text-foreground";
  const monoCols = align === "right" ? "font-mono tabular-nums currency" : "";
  return (
    <td
      className={[
        "px-3 py-3",
        align === "right" ? "text-right" : "text-left",
        monoCols,
        strong ? "font-medium" : "",
        color,
      ].join(" ")}
    >
      {children}
    </td>
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
