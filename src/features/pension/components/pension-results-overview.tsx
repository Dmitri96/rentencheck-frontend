"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Rentencheck } from "@/lib/services/rentencheck-service";
import { aggregateIncomeSources } from "../utils/income-aggregator";

interface PensionResultsOverviewProps {
  data: Rentencheck;
  desiredPension: number; // Monthly desired pension amount
}

/**
 * Pension Results Overview Component
 *
 * Displays a comprehensive overview of pension data directly from backend structure.
 * Shows all contract data and calculates basic pension gap analysis.
 */
export function PensionResultsOverview({ data, desiredPension }: PensionResultsOverviewProps) {
  // Tax rates (German standard rates)
  const TAX_RATE = 0.42; // 42% income tax for higher income
  const CHURCH_TAX_RATE = 0.09; // 9% church tax (on income tax)
  const SOLIDARITY_TAX_RATE = 0.055; // 5.5% solidarity surcharge (on income tax)
  const HEALTH_INSURANCE_RATE = 0.073; // 7.3% health insurance
  const INFLATION_RATE = 0.02; // 2% annual inflation

  /**
   * Calculate net amounts after taxes and deductions
   */
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

  /**
   * Format currency values for display
   */
  const formatCurrency = (amount: number, showSign = false) => {
    const formatted = new Intl.NumberFormat("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount));

    const sign = showSign && amount !== 0 ? (amount > 0 ? "+" : "-") : "";
    return `${sign}${formatted} €`;
  };

  /**
   * Build display rows by running the shared aggregator then applying local
   * tax/deduction rates specific to this overview component.
   */
  const incomeData = aggregateIncomeSources(data.step_3_data ?? null).map(
    ({ label, monthlyGross }) => ({
      source: label,
      ...calculateNetAmounts(monthlyGross),
    }),
  );

  // Calculate totals
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

  // Calculate pension gap
  const pensionGap = Math.max(0, desiredPension - totals.purchasingPower);
  const additionalCapitalNeeded = pensionGap * 12 * 20; // 20 years of pension
  const inflationAdjustedCapital = additionalCapitalNeeded * Math.pow(1 + INFLATION_RATE, 20);

  return (
    <div className="space-y-6">
      {/* Header with desired pension */}
      <Card>
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-center text-xl font-bold text-blue-900">
            Rentenbedarfsanalyse - Ergebnisse
          </CardTitle>
          <div className="text-center">
            <div className="text-sm text-gray-600">Ihr Rentenwunsch</div>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(desiredPension)}</div>
          </div>
        </CardHeader>
      </Card>

      {/* Main results table */}
      <Card>
        <CardHeader>
          <CardTitle>Berechnungsergebnisse</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3 font-medium text-gray-700">EINKOMMENSQUELLE</th>
                  <th className="text-right p-3 font-medium text-gray-700">BRUTTO</th>
                  <th className="text-right p-3 font-medium text-red-600">STEUER</th>
                  <th className="text-right p-3 font-medium text-red-600">KIRCHE</th>
                  <th className="text-right p-3 font-medium text-red-600">SOLI</th>
                  <th className="text-right p-3 font-medium text-gray-700">NACH STEUER</th>
                  <th className="text-right p-3 font-medium text-red-600">KV</th>
                  <th className="text-right p-3 font-medium text-green-600">NACH KV</th>
                  <th className="text-right p-3 font-medium text-green-600">KAUFKRAFT</th>
                </tr>
              </thead>
              <tbody>
                {incomeData.map((row, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{row.source}</td>
                    <td className="p-3 text-right">{formatCurrency(row.grossAmount)}</td>
                    <td className="p-3 text-right text-red-600">{formatCurrency(row.incomeTax)}</td>
                    <td className="p-3 text-right text-red-600">{formatCurrency(row.churchTax)}</td>
                    <td className="p-3 text-right text-red-600">
                      {formatCurrency(row.solidarityTax)}
                    </td>
                    <td className="p-3 text-right">{formatCurrency(row.afterTax)}</td>
                    <td className="p-3 text-right text-red-600">
                      {formatCurrency(row.healthInsurance)}
                    </td>
                    <td className="p-3 text-right text-green-600 font-medium">
                      {formatCurrency(row.afterHealthInsurance)}
                    </td>
                    <td className="p-3 text-right text-green-600 font-bold">
                      {formatCurrency(row.purchasingPower)}
                    </td>
                  </tr>
                ))}

                {/* Totals row */}
                <tr className="border-t-2 border-gray-800 bg-gray-100 font-bold">
                  <td className="p-3 font-bold">Gesamt</td>
                  <td className="p-3 text-right">{formatCurrency(totals.grossAmount)}</td>
                  <td className="p-3 text-right text-red-600">
                    {formatCurrency(totals.incomeTax)}
                  </td>
                  <td className="p-3 text-right text-red-600">
                    {formatCurrency(totals.churchTax)}
                  </td>
                  <td className="p-3 text-right text-red-600">
                    {formatCurrency(totals.solidarityTax)}
                  </td>
                  <td className="p-3 text-right">{formatCurrency(totals.afterTax)}</td>
                  <td className="p-3 text-right text-red-600">
                    {formatCurrency(totals.healthInsurance)}
                  </td>
                  <td className="p-3 text-right text-green-600">
                    {formatCurrency(totals.afterHealthInsurance)}
                  </td>
                  <td className="p-3 text-right text-green-600 text-lg">
                    {formatCurrency(totals.purchasingPower)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 text-xs text-gray-500 border-t">
            * Alle Beträge sind monatliche Werte. Die Kaufkraft berücksichtigt die Inflation über 2%
            p.a.
          </div>
        </CardContent>
      </Card>

      {/* Pension gap analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Versorgungslücke
            {pensionGap > 0 && (
              <Badge variant="destructive" className="ml-2">
                {formatCurrency(pensionGap)} monatlich
              </Badge>
            )}
            {pensionGap === 0 && (
              <Badge variant="default" className="ml-2 bg-green-600">
                Vollständig abgedeckt
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Rentenwunsch</div>
              <div className="text-xl font-bold text-blue-600">
                {formatCurrency(desiredPension)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Verfügbare Rente</div>
              <div className="text-xl font-bold text-green-600">
                {formatCurrency(totals.purchasingPower)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Versorgungslücke</div>
              <div
                className={`text-xl font-bold ${pensionGap > 0 ? "text-red-600" : "text-green-600"}`}
              >
                {formatCurrency(pensionGap)}
              </div>
            </div>
          </div>

          {pensionGap > 0 && (
            <>
              <Separator className="my-6" />
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 className="font-medium text-orange-800 mb-3">
                  Zusätzlicher Kapitalbedarf bei 2% Inflation:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Kapitalbedarf (heutiger Wert)</div>
                    <div className="text-lg font-bold text-orange-700">
                      {formatCurrency(additionalCapitalNeeded)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Inflationsbereinigt (20 Jahre)</div>
                    <div className="text-lg font-bold text-orange-700">
                      {formatCurrency(inflationAdjustedCapital)}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-3">
                  Dies entspricht einem zusätzlichen Kapitalbedarf pro Jahr von:{" "}
                  <strong>{formatCurrency(inflationAdjustedCapital / 20)}</strong>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Summary recommendations */}
      {pensionGap > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800">
              Empfehlungen zur Schließung der Versorgungslücke
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>Erhöhung der privaten Altersvorsorge:</strong> Zusätzliche monatliche
                  Einzahlungen in private Rentenversicherungen oder Fondssparpläne.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>Betriebliche Altersvorsorge:</strong> Maximierung der betrieblichen
                  Vorsorge durch Entgeltumwandlung oder Arbeitgeberzuschüsse.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>Riester-Rente:</strong> Nutzung staatlicher Förderungen für zusätzliche
                  Rentenerträge.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>Immobilieninvestments:</strong> Aufbau von Mieteinnahmen zur Ergänzung der
                  Altersrente.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-xs text-gray-500 text-center">
        * Alle Berechnungen sind Schätzungen. Für eine detaillierte Planung sollten individuelle
        Faktoren wie Steuern, Inflation und Versicherungsleistungen berücksichtigt werden.
      </div>
    </div>
  );
}
