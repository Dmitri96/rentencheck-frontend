"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { Rentencheck } from "@/lib/services/rentencheck-service";
import { RentencheckService } from "@/lib/services/rentencheck-service";
import { aggregateIncomeSources } from "../utils/income-aggregator";

interface PensionResultsTableProps {
  data: Rentencheck;
  desiredPension: number;
}

type ParametersShape =
  import("@/lib/services/rentencheck-service").PensionCalculationData["parameters_used"];

interface IncomeRowComputed {
  label: string;
  brutto: number;
  taxSharePct: number;
  incomeTax: number;
  churchTax: number;
  soli: number;
  afterTax: number;
  kvSharePct: number;
  healthInsurance: number;
  afterKV: number;
  purchasingPower: number;
}

const eur = (value: number) =>
  new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export function PensionResultsTable({ data }: PensionResultsTableProps) {
  const [parameters, setParameters] = useState<ParametersShape | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await RentencheckService.getPensionCalculation(data.client_id, data.id);
        if (!mounted) return;
        setParameters(res.pension_data.parameters_used);
      } catch {
        if (!mounted) return;
        setParameters({
          economic_assumptions: {
            inflation_rate: 2,
            investment_return_rate: 3,
            pension_increase_rate: 1,
          },
          social_insurance: {
            health_insurance_rate: 7.3,
            care_insurance_rate: 1.525,
            total_insurance_rate: 12.15,
          },
          tax_system: {
            rates: { stufe_4: 42 },
            thresholds: {},
            solidarity_surcharge_rate: 5.5,
          },
        });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [data.client_id, data.id]);

  const rows: IncomeRowComputed[] = useMemo(() => {
    if (!parameters) return [];

    const effectiveTaxRate = parameters.tax_system.rates.stufe_4 ?? 42;
    const churchTaxRate = 9;
    const soliRate = parameters.tax_system.solidarity_surcharge_rate ?? 5.5;
    const kvRate = parameters.social_insurance.total_insurance_rate ?? 12.15;
    const inflation = parameters.economic_assumptions.inflation_rate ?? 2;
    const hasChurchTax = data.step_1_data?.hasToChurchTax ?? false;

    const yearsToRetirement = Math.max(
      0,
      (data.step_2_data?.retirementAge || 67) - (data.step_2_data?.currentAge || 30),
    );

    const compute = (
      label: string,
      brutto: number,
      taxSharePct = 100,
      kvSharePct = 100,
    ): IncomeRowComputed => {
      const taxBase = brutto * (taxSharePct / 100);
      const incomeTax = taxBase * (effectiveTaxRate / 100);
      const churchTax = hasChurchTax ? brutto * (churchTaxRate / 100) : 0;
      const soli = brutto * (soliRate / 100);
      const afterTax = brutto - incomeTax - churchTax - soli;
      const healthInsurance = brutto * (kvSharePct / 100) * (kvRate / 100);
      const afterKV = afterTax - healthInsurance;
      const purchasingPower = afterKV / Math.pow(1 + inflation / 100, yearsToRetirement);

      return {
        label,
        brutto,
        taxSharePct,
        incomeTax,
        churchTax,
        soli,
        afterTax,
        kvSharePct,
        healthInsurance,
        afterKV,
        purchasingPower,
      };
    };

    const sources = aggregateIncomeSources(data.step_3_data ?? null);
    const items: IncomeRowComputed[] = sources.map(({ label, monthlyGross }) =>
      compute(label, monthlyGross, 100, 100),
    );

    return items;
  }, [data, parameters]);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, r) => ({
        brutto: acc.brutto + r.brutto,
        incomeTax: acc.incomeTax + r.incomeTax,
        churchTax: acc.churchTax + r.churchTax,
        soli: acc.soli + r.soli,
        afterTax: acc.afterTax + r.afterTax,
        healthInsurance: acc.healthInsurance + r.healthInsurance,
        afterKV: acc.afterKV + r.afterKV,
        purchasingPower: acc.purchasingPower + r.purchasingPower,
      }),
      {
        brutto: 0,
        incomeTax: 0,
        churchTax: 0,
        soli: 0,
        afterTax: 0,
        healthInsurance: 0,
        afterKV: 0,
        purchasingPower: 0,
      },
    );
  }, [rows]);

  if (loading || !parameters) {
    return (
      <div className="w-full border border-border rounded-md px-6 py-6 text-center text-sm text-muted-foreground">
        Tabelle wird mit aktuellen Parametern berechnet…
      </div>
    );
  }

  const effectiveTaxRate = parameters.tax_system.rates.stufe_4 ?? 42;
  const soliRate = parameters.tax_system.solidarity_surcharge_rate ?? 5.5;
  const kvRate = parameters.social_insurance.total_insurance_rate ?? 12.15;
  const hasChurchTaxHeader = data.step_1_data?.hasToChurchTax ?? false;

  return (
    <div className="bg-card rounded-md border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border-subtle bg-[var(--surface-subtle)]">
        <h4 className="text-foreground font-medium">Berechnungstabelle</h4>
        <div className="mt-2 text-xs text-muted-foreground grid grid-cols-2 md:grid-cols-4 gap-2 font-mono tabular-nums">
          <div>Steuer: {effectiveTaxRate}%</div>
          <div>Kirchensteuer: {hasChurchTaxHeader ? "9% (auf Brutto)" : "0% (aus)"}</div>
          <div>Soli: {soliRate}% (auf Brutto)</div>
          <div>Ges. KV: {kvRate}%</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle">
              <Th align="left">Einkommensquelle</Th>
              <Th>Brutto</Th>
              <Th align="center">Anteil</Th>
              <Th>Steuer</Th>
              <Th>Kirche</Th>
              <Th>Soli</Th>
              <Th>Nach Steuer</Th>
              <Th align="center">Anteil</Th>
              <Th>Ges. KV</Th>
              <Th>Nach KV</Th>
              <Th>Kaufkraft</Th>
            </tr>
          </thead>
          <tbody className="[&_tr:nth-child(even)]:bg-[var(--surface-subtle)]">
            {rows.map((r, idx) => (
              <tr key={idx}>
                <Td align="left" strong>
                  {r.label}
                </Td>
                <Td>{eur(r.brutto)}</Td>
                <Td align="center" tone="muted">
                  {r.taxSharePct.toFixed(0)}%
                </Td>
                <Td tone="muted">{eur(r.incomeTax)}</Td>
                <Td tone="muted">{eur(r.churchTax)}</Td>
                <Td tone="muted">{eur(r.soli)}</Td>
                <Td>{eur(r.afterTax)}</Td>
                <Td align="center" tone="muted">
                  {r.kvSharePct.toFixed(0)}%
                </Td>
                <Td tone="muted">{eur(r.healthInsurance)}</Td>
                <Td tone="success">{eur(r.afterKV)}</Td>
                <Td tone="success" strong>
                  {eur(r.purchasingPower)}
                </Td>
              </tr>
            ))}

            <tr className="border-t border-foreground/20 bg-muted">
              <Td align="left" strong>
                Gesamt
              </Td>
              <Td strong>{eur(totals.brutto)}</Td>
              <Td align="center" tone="muted">
                –
              </Td>
              <Td tone="muted">{eur(totals.incomeTax)}</Td>
              <Td tone="muted">{eur(totals.churchTax)}</Td>
              <Td tone="muted">{eur(totals.soli)}</Td>
              <Td strong>{eur(totals.afterTax)}</Td>
              <Td align="center" tone="muted">
                –
              </Td>
              <Td tone="muted">{eur(totals.healthInsurance)}</Td>
              <Td tone="success" strong>
                {eur(totals.afterKV)}
              </Td>
              <Td tone="success" strong>
                {eur(totals.purchasingPower)}
              </Td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({
  children,
  align = "right",
}: {
  children: React.ReactNode;
  align?: "left" | "right" | "center";
}) {
  const cls = align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
  return <th className={`label-uppercase px-3 py-3 ${cls}`}>{children}</th>;
}

function Td({
  children,
  align = "right",
  strong = false,
  tone,
}: {
  children: React.ReactNode;
  align?: "left" | "right" | "center";
  strong?: boolean;
  tone?: "muted" | "success";
}) {
  const color =
    tone === "muted"
      ? "text-muted-foreground"
      : tone === "success"
        ? "text-success"
        : "text-foreground";
  const monoCols = align !== "left" ? "font-mono tabular-nums currency" : "";
  const cls = align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
  return (
    <td className={["px-3 py-3", cls, monoCols, strong ? "font-medium" : "", color].join(" ")}>
      {children}
    </td>
  );
}
