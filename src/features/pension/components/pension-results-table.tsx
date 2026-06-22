"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { Rentencheck } from "@/lib/services/rentencheck-service";
import { RentencheckService } from "@/lib/services/rentencheck-service";
import { aggregateIncomeSources } from "../utils/income-aggregator";

interface PensionResultsTableProps {
  data: Rentencheck;
  desiredPension: number;
}

// Re-use the central PensionCalculationData['parameters_used'] from rentencheck-service
// rather than defining a parallel structural type — the previous local copy drifted.
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

const currency = (value: number) =>
  `${value.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€`;

export function PensionResultsTable({ data, desiredPension }: PensionResultsTableProps) {
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
        // fallback parameters if backend call fails
        if (!mounted) return;
        // Defensive fallback when the backend calculation endpoint fails — keeps
        // the table renderable with conservative German defaults instead of crashing.
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
    const churchTaxRate = 9; // 9% vom Brutto laut Vorgabe
    const soliRate = parameters.tax_system.solidarity_surcharge_rate ?? 5.5; // 5,5% vom Brutto laut Vorgabe
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
      // Ges. KV laut Vorgabe auf Brutto berechnen (nicht auf Nach-Steuer)
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

    // Delegate income source enumeration to the shared aggregator so both result
    // views (overview + table) use the same traversal logic.
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
      <div className="w-full border rounded-lg p-6 text-center text-sm text-gray-600">
        Tabelle wird mit aktuellen Parametern berechnet...
      </div>
    );
  }

  const effectiveTaxRate = parameters.tax_system.rates.stufe_4 ?? 42;
  const soliRate = parameters.tax_system.solidarity_surcharge_rate ?? 5.5;
  const kvRate = parameters.social_insurance.total_insurance_rate ?? 12.15;
  const hasChurchTaxHeader = data.step_1_data?.hasToChurchTax ?? false;

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="px-4 py-3 border-b bg-gray-50">
        <h3 className="font-semibold text-gray-900">Berechnungstabelle</h3>
        <div className="mt-1 text-xs text-gray-600 grid grid-cols-2 md:grid-cols-4 gap-2">
          <div>Steuer: {effectiveTaxRate}%</div>
          <div>Kirchensteuer: {hasChurchTaxHeader ? "9% (auf Brutto)" : "0% (aus)"}</div>
          <div>Soli: {soliRate}% (auf Brutto)</div>
          <div>Ges. KV: {kvRate}%</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-3 text-left">EINKOMMENSQUELLE</th>
              <th className="p-3 text-right">BRUTTO</th>
              <th className="p-3 text-center">ANTEIL</th>
              <th className="p-3 text-right">STEUER</th>
              <th className="p-3 text-right">KIRCHE</th>
              <th className="p-3 text-right">SOLI</th>
              <th className="p-3 text-right">NACH STEUER</th>
              <th className="p-3 text-center">ANTEIL</th>
              <th className="p-3 text-right">GES. KV</th>
              <th className="p-3 text-right">NACH KV</th>
              <th className="p-3 text-right">KAUFKRAFT</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{r.label}</td>
                <td className="p-3 text-right">{currency(r.brutto)}</td>
                <td className="p-3 text-center">{r.taxSharePct.toFixed(0)}%</td>
                <td className="p-3 text-right text-red-600">{currency(r.incomeTax)}</td>
                <td className="p-3 text-right text-red-600">{currency(r.churchTax)}</td>
                <td className="p-3 text-right text-red-600">{currency(r.soli)}</td>
                <td className="p-3 text-right">{currency(r.afterTax)}</td>
                <td className="p-3 text-center">{r.kvSharePct.toFixed(0)}%</td>
                <td className="p-3 text-right text-red-600">{currency(r.healthInsurance)}</td>
                <td className="p-3 text-right text-green-700 font-medium">{currency(r.afterKV)}</td>
                <td className="p-3 text-right text-emerald-700 font-bold">
                  {currency(r.purchasingPower)}
                </td>
              </tr>
            ))}

            <tr className="bg-gray-100 font-semibold border-t-2 border-gray-700">
              <td className="p-3">Gesamt</td>
              <td className="p-3 text-right">{currency(totals.brutto)}</td>
              <td className="p-3 text-center">–</td>
              <td className="p-3 text-right">{currency(totals.incomeTax)}</td>
              <td className="p-3 text-right">{currency(totals.churchTax)}</td>
              <td className="p-3 text-right">{currency(totals.soli)}</td>
              <td className="p-3 text-right">{currency(totals.afterTax)}</td>
              <td className="p-3 text-center">–</td>
              <td className="p-3 text-right">{currency(totals.healthInsurance)}</td>
              <td className="p-3 text-right">{currency(totals.afterKV)}</td>
              <td className="p-3 text-right">{currency(totals.purchasingPower)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
