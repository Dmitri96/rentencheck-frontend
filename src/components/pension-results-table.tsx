"use client"

import React, { useEffect, useMemo, useState } from 'react'
import type { Rentencheck } from '@/lib/services/rentencheck-service'
import { RentencheckService } from '@/lib/services/rentencheck-service'

interface PensionResultsTableProps {
  data: Rentencheck
  desiredPension: number
}

interface ParametersShape {
  economic_assumptions: {
    inflation_rate: number
    pension_increase_rate?: number
  }
  social_insurance: {
    total_insurance_rate: number
  }
  tax_system: {
    rates: {
      stufe_1?: number
      stufe_2?: number
      stufe_3?: number
      stufe_4?: number
      stufe_5?: number
    }
    solidarity_surcharge_rate: number
  }
}

interface IncomeRowComputed {
  label: string
  brutto: number
  taxSharePct: number
  incomeTax: number
  churchTax: number
  soli: number
  afterTax: number
  kvSharePct: number
  healthInsurance: number
  afterKV: number
  purchasingPower: number
}

const currency = (value: number) =>
  `${value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`

export function PensionResultsTable({ data, desiredPension }: PensionResultsTableProps) {
  const [parameters, setParameters] = useState<ParametersShape | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        const res = await RentencheckService.getPensionCalculation(
          data.client_id,
          data.id,
        )
        if (!mounted) return
        setParameters(res.pension_data.parameters_used)
      } catch {
        // fallback parameters if backend call fails
        if (!mounted) return
        setParameters({
          economic_assumptions: { inflation_rate: 2, pension_increase_rate: 1 },
          social_insurance: { total_insurance_rate: 12.15 },
          tax_system: {
            rates: { stufe_4: 42 },
            solidarity_surcharge_rate: 5.5,
          },
        })
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [data.client_id, data.id])

  const rows: IncomeRowComputed[] = useMemo(() => {
    if (!parameters) return []

    const effectiveTaxRate = parameters.tax_system.rates.stufe_4 ?? 42
    const churchTaxRate = 9 // 9% vom Brutto laut Vorgabe
    const soliRate = parameters.tax_system.solidarity_surcharge_rate ?? 5.5 // 5,5% vom Brutto laut Vorgabe
    const kvRate = parameters.social_insurance.total_insurance_rate ?? 12.15
    const inflation = parameters.economic_assumptions.inflation_rate ?? 2

    const yearsToRetirement = Math.max(
      0,
      (data.step_2_data?.retirementAge || 67) - (data.step_2_data?.currentAge || 30),
    )

    const compute = (
      label: string,
      brutto: number,
      taxSharePct = 100,
      kvSharePct = 100,
    ): IncomeRowComputed => {
      const taxBase = brutto * (taxSharePct / 100)
      const incomeTax = taxBase * (effectiveTaxRate / 100)
      // Anpassung gemäß Excel-Vorgabe: Kirche und Soli werden direkt vom Brutto berechnet
      const churchTax = brutto * (churchTaxRate / 100)
      const soli = brutto * (soliRate / 100)
      const afterTax = brutto - incomeTax - churchTax - soli
      // Ges. KV laut Vorgabe auf Brutto berechnen (nicht auf Nach-Steuer)
      const healthInsurance = brutto * (kvSharePct / 100) * (kvRate / 100)
      const afterKV = afterTax - healthInsurance
      const purchasingPower = afterKV / Math.pow(1 + inflation / 100, yearsToRetirement)

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
      }
    }

    const items: IncomeRowComputed[] = []

    // 1. Gesetzliche Versorgung
    if (data.step_3_data?.statutoryPensionClaims && data.step_3_data?.statutoryPensionAmount) {
      const pensionIncrease = parameters.economic_assumptions.pension_increase_rate ?? 0
      const brutto = Number(data.step_3_data.statutoryPensionAmount) * (1 + pensionIncrease / 100)
      items.push(
        compute('Gesetzl. Versorgung (inkl. Rentensteigerung)', brutto, 100, 100),
      )
    }

    // 2. Rentenverträge (Basis, BAV, Riester, Privat)
    const pensionContracts = data.step_3_data?.pensionContracts || []
    const groupedByType = pensionContracts.reduce<Record<string, number>>((acc, c: any) => {
      const type = c.contractType || 'Sonstige Rente'
      const amount = Number(c.monthlyAmount) || 0
      acc[type] = (acc[type] || 0) + amount
      return acc
    }, {})

    Object.entries(groupedByType).forEach(([type, amount]) => {
      // Default shares 100%/100%; adjust here if needed per type
      items.push(compute(type, amount, 100, 100))
    })

    // 3. Auszahlungsverträge (Einmalbetrag -> Monatsäquivalent)
    const payoutContracts = data.step_3_data?.payoutContracts || []
    if (payoutContracts.length > 0) {
      const monthly = payoutContracts.reduce((sum: number, c: any) => {
        const guaranteed = Number(c.guaranteedAmount) || 0
        return sum + guaranteed / 240 // 20 Jahre -> 240 Monate
      }, 0)
      if (monthly > 0) items.push(compute('Auszahlungsverträge (äquiv. mtl.)', monthly, 100, 100))
    }

    // 4. Zusatzeinkommen
    const additionalIncome = data.step_3_data?.additionalIncome || []
    if (additionalIncome.length > 0) {
      const groupedIncome = additionalIncome.reduce<Record<string, number>>((acc, i: any) => {
        let monthly = Number(i.amount) || 0
        if (i.frequency === 'Jährlich') monthly = monthly / 12
        if (i.frequency === 'Einmalig') monthly = monthly / 240
        const label = i.type || 'Zusatzeinkommen'
        acc[label] = (acc[label] || 0) + monthly
        return acc
      }, {})
      Object.entries(groupedIncome).forEach(([label, amount]) => items.push(compute(label, amount, 100, 100)))
    }

    return items
  }, [data, parameters])

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
    )
  }, [rows])

  if (loading || !parameters) {
    return (
      <div className="w-full border rounded-lg p-6 text-center text-sm text-gray-600">
        Tabelle wird mit aktuellen Parametern berechnet...
      </div>
    )
  }

  const effectiveTaxRate = parameters.tax_system.rates.stufe_4 ?? 42
  const soliRate = parameters.tax_system.solidarity_surcharge_rate ?? 5.5
  const kvRate = parameters.social_insurance.total_insurance_rate ?? 12.15

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="px-4 py-3 border-b bg-gray-50">
        <h3 className="font-semibold text-gray-900">Berechnungstabelle (1:1 Spalten wie Excel)</h3>
        <div className="mt-1 text-xs text-gray-600 grid grid-cols-2 md:grid-cols-4 gap-2">
          <div>Steuer: {effectiveTaxRate}%</div>
          <div>Kirchensteuer: 9% (auf Brutto)</div>
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
                <td className="p-3 text-right text-emerald-700 font-bold">{currency(r.purchasingPower)}</td>
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

      <div className="px-4 py-3 text-xs text-gray-500 border-t">
        Hinweis: Die Spalten und Reihenfolge entsprechen 1:1 der Excel-Vorlage. 
        Werte verwenden die dynamischen Parameter (Inflation, KV, Steuer). 
        Kaufkraft ist auf heutige Preise zum Rentenbeginn diskontiert.
      </div>
    </div>
  )
}


