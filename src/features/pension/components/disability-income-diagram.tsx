"use client";

import { useEffect, useState } from "react";
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
import { GERMAN_TAX_2024 } from "../constants/german-tax-2024";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface DisabilityIncomeProps {
  initialSalary?: number;
  initialNetSalary?: number;
  showIncomeInputs?: boolean;
  // Optional override for Erwerbsminderungsrente (net, monthly)
  disabilityPensionNetAmount?: number;
}

function calculateNetFromGross(grossSalary: number): number {
  const { socialSecurityRate, incomeTaxBrackets, solidaritySurchargeRate } = GERMAN_TAX_2024;
  const taxableIncome = grossSalary - grossSalary * socialSecurityRate;
  const yearlyTaxable = taxableIncome * 12;

  let annualIncomeTax = 0;
  for (const bracket of incomeTaxBrackets) {
    if (yearlyTaxable <= bracket.upTo) {
      if ("baseAmount" in bracket) {
        annualIncomeTax =
          bracket.baseAmount + (yearlyTaxable - bracket.baseThreshold) * bracket.rate;
      }
      break;
    }
  }

  const monthlyIncomeTax = annualIncomeTax / 12;
  const solidarityTax = monthlyIncomeTax * solidaritySurchargeRate;

  const netSalary =
    grossSalary - grossSalary * socialSecurityRate - monthlyIncomeTax - solidarityTax;
  return Math.round(netSalary);
}

export function DisabilityIncomeDiagram({
  initialSalary = 4000,
  initialNetSalary,
  showIncomeInputs = false,
  disabilityPensionNetAmount,
}: DisabilityIncomeProps) {
  const [monthlySalary, setMonthlySalary] = useState(initialSalary);
  const [monthlyNetSalary, setMonthlyNetSalary] = useState(
    initialNetSalary ?? calculateNetFromGross(initialSalary),
  );
  const [privateInsurance, setPrivateInsurance] = useState(2000);

  // Keep internal state in sync when parent-provided income changes
  useEffect(() => {
    setMonthlySalary(initialSalary);
  }, [initialSalary]);

  useEffect(() => {
    setMonthlyNetSalary(initialNetSalary ?? calculateNetFromGross(initialSalary));
  }, [initialNetSalary, initialSalary]);

  const handleGrossChange = (value: number) => {
    setMonthlySalary(value);
    setMonthlyNetSalary(calculateNetFromGross(value));
  };

  const handleNetChange = (value: number) => {
    setMonthlyNetSalary(value);
    // Approximate gross from net (simplified reverse calculation)
    const estimatedGross = Math.round(value / 0.65); // Rough estimate
    setMonthlySalary(estimatedGross);
  };

  // Calculate income stages - both gross and net
  const fullSalaryGross = monthlySalary;
  const fullSalaryNet = monthlyNetSalary;

  const krankengeldGross = Math.round(monthlySalary * 0.7); // 70% of gross salary
  const krankengeld90PercentNet = Math.round(monthlyNetSalary * 0.9); // 90% of net salary
  const krankengeldNet = Math.min(krankengeldGross, krankengeld90PercentNet); // Actual net amount received

  // Erwerbsminderungsrente: use provided net amount if available, otherwise estimate
  const estimatedEmrGross = Math.round(monthlySalary * 0.35); // ~35% typical disability pension
  const estimatedEmrNet = Math.round(estimatedEmrGross * 0.85);
  const erwerbsminderungsrenteNet =
    disabilityPensionNetAmount != null ? Math.round(disabilityPensionNetAmount) : estimatedEmrNet;
  const erwerbsminderungsrenteGross =
    disabilityPensionNetAmount != null
      ? Math.round(disabilityPensionNetAmount / 0.85)
      : estimatedEmrGross;

  const privateInsuranceBenefit = privateInsurance;
  const totalWithInsuranceGross = erwerbsminderungsrenteGross + privateInsuranceBenefit;
  const totalWithInsuranceNet = erwerbsminderungsrenteNet + privateInsuranceBenefit; // Private insurance usually tax-free

  const chartData = {
    labels: [
      "Vollgehalt\n(6 Wochen)",
      "Krankengeld\n(72 Wochen)",
      "Erwerbsminderungs-\nrente",
      "Mit privater\nVersicherung",
    ],
    datasets: [
      {
        label: "Netto (verfügbar)",
        data: [fullSalaryNet, krankengeldNet, erwerbsminderungsrenteNet, totalWithInsuranceNet],
        // Chart series colors aligned with brief: navy → amber → terracotta → forest
        backgroundColor: [
          "oklch(0.32 0.075 260)", // navy
          "oklch(0.65 0.13 65)", // amber
          "oklch(0.52 0.18 25)", // terracotta
          "oklch(0.5 0.1 155)", // forest
        ],
        borderColor: [
          "oklch(0.27 0.075 260)",
          "oklch(0.55 0.13 65)",
          "oklch(0.42 0.18 25)",
          "oklch(0.4 0.1 155)",
        ],
        borderWidth: 2,
      },
      {
        label: "Steuern & Abgaben",
        data: [
          fullSalaryGross - fullSalaryNet,
          krankengeldGross - krankengeldNet,
          erwerbsminderungsrenteGross - erwerbsminderungsrenteNet,
          totalWithInsuranceGross - totalWithInsuranceNet,
        ],
        // Lighter siblings of the brief's chart series for the deductions overlay
        backgroundColor: [
          "oklch(0.55 0.055 260)",
          "oklch(0.8 0.1 65)",
          "oklch(0.7 0.13 25)",
          "oklch(0.7 0.08 155)",
        ],
        borderColor: [
          "oklch(0.27 0.075 260)",
          "oklch(0.55 0.13 65)",
          "oklch(0.42 0.18 25)",
          "oklch(0.4 0.1 155)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        ticks: {
          color: "oklch(0.22 0.025 260)",
          font: { size: 12 },
        },
        grid: { display: false },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        max: Math.max(fullSalaryGross * 1.1, totalWithInsuranceGross * 1.1),
        ticks: {
          callback: (value) => "€" + Number(value).toLocaleString(),
          color: "oklch(0.42 0.022 260)",
        },
        grid: { color: "oklch(0.9 0.008 80)" },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: true,
        text: "Einkommensverlauf bei Berufsunfähigkeit (Brutto & Netto)",
        font: { size: 16, weight: "normal" },
        color: "oklch(0.22 0.025 260)",
      },
      tooltip: {
        backgroundColor: "oklch(0.22 0.025 260)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "oklch(0.32 0.075 260)",
        borderWidth: 1,
        cornerRadius: 6,
        callbacks: {
          label: (context) => {
            const datasetLabel = context.dataset.label;
            const value = context.parsed.y ?? 0;
            if (datasetLabel === "Netto (verfügbar)") {
              return `Netto: €${value.toLocaleString()}`;
            } else {
              return `Steuern/Abgaben: €${value.toLocaleString()}`;
            }
          },
          afterLabel: (context) => {
            const index = context.dataIndex;
            const grossAmounts = [
              fullSalaryGross,
              krankengeldGross,
              erwerbsminderungsrenteGross,
              totalWithInsuranceGross,
            ];
            const netAmounts = [
              fullSalaryNet,
              krankengeldNet,
              erwerbsminderungsrenteNet,
              totalWithInsuranceNet,
            ];

            const gross = grossAmounts[index] ?? 0;
            const net = netAmounts[index] ?? 0;
            return [
              `Brutto: €${gross.toLocaleString()}`,
              `Netto: €${net.toLocaleString()}`,
              `Abzüge: €${(gross - net).toLocaleString()}`,
            ];
          },
        },
      },
    },
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">
            Berufsunfähigkeit: Einkommensausfälle visualisiert
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Sehen Sie, wie sich Ihr Einkommen bei Krankheit und Berufsunfähigkeit entwickelt
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {showIncomeInputs ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary">Monatliches Bruttoeinkommen</Label>
                <Input
                  id="salary"
                  type="number"
                  value={monthlySalary}
                  onChange={(e) => handleGrossChange(Number(e.target.value))}
                  className="text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="netSalary">Monatliches Nettoeinkommen</Label>
                <Input
                  id="netSalary"
                  type="number"
                  value={monthlyNetSalary}
                  onChange={(e) => handleNetChange(Number(e.target.value))}
                  className="text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insurance">Private BU-Rente (gewünscht)</Label>
                <Input
                  id="insurance"
                  type="number"
                  value={privateInsurance}
                  onChange={(e) => setPrivateInsurance(Number(e.target.value))}
                  className="text-lg"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="insurance">Private BU-Rente (gewünscht)</Label>
                <Input
                  id="insurance"
                  type="number"
                  value={privateInsurance}
                  onChange={(e) => setPrivateInsurance(Number(e.target.value))}
                  className="text-lg"
                />
              </div>
            </div>
          )}

          {/* Chart */}
          <div className="h-96 w-full">
            <Bar data={chartData} options={options} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-chart-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Krankengeld (GKV)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-chart-2">
                    €{krankengeldNet.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Netto verfügbar</div>
                  <div className="text-sm">Brutto: €{krankengeldGross.toLocaleString()}</div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  70% des Bruttogehalts für max. 72 Wochen
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-destructive">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Erwerbsminderungsrente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-destructive">
                    €{erwerbsminderungsrenteNet.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Netto verfügbar</div>
                  <div className="text-sm">
                    Brutto: €{erwerbsminderungsrenteGross.toLocaleString()}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Staatliche Rente bei Berufsunfähigkeit
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Mit privater BU</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-primary">
                    €{totalWithInsuranceNet.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Netto verfügbar</div>
                  <div className="text-sm">Brutto: €{totalWithInsuranceGross.toLocaleString()}</div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Staatliche + private Absicherung
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">Zeitlicher Ablauf</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-full bg-chart-1 text-primary-foreground flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <div className="font-medium">Erste 6 Wochen</div>
                    <div className="text-sm text-muted-foreground">
                      Arbeitgeber zahlt 100% Gehalt (Entgeltfortzahlung)
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-full bg-chart-2 text-secondary-foreground flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <div className="font-medium">Wochen 7-78</div>
                    <div className="text-sm text-muted-foreground">
                      Krankengeld von der GKV (70% des Bruttogehalts)
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <div className="font-medium">Nach 78 Wochen</div>
                    <div className="text-sm text-muted-foreground">
                      Erwerbsminderungsrente oder Arbeitslosengeld
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
