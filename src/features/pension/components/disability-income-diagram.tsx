"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface DisabilityIncomeProps {
  initialSalary?: number;
  initialNetSalary?: number;
  showIncomeInputs?: boolean;
  // Optional override for Erwerbsminderungsrente (net, monthly)
  disabilityPensionNetAmount?: number;
}

function calculateNetFromGross(grossSalary: number): number {
  // Simplified German tax calculation for 2024
  const socialSecurityRate = 0.2025; // ~20.25% (pension, unemployment, health, care insurance)
  const taxableIncome = grossSalary - grossSalary * socialSecurityRate;

  // Progressive income tax (simplified)
  let incomeTax = 0;
  const yearlyTaxable = taxableIncome * 12;

  if (yearlyTaxable <= 10908) {
    incomeTax = 0;
  } else if (yearlyTaxable <= 15999) {
    incomeTax = (yearlyTaxable - 10908) * 0.14;
  } else if (yearlyTaxable <= 62809) {
    incomeTax = 713 + (yearlyTaxable - 15999) * 0.24;
  } else if (yearlyTaxable <= 277825) {
    incomeTax = 11934 + (yearlyTaxable - 62809) * 0.42;
  } else {
    incomeTax = 102130 + (yearlyTaxable - 277825) * 0.45;
  }

  const monthlyIncomeTax = incomeTax / 12;
  const solidarityTax = monthlyIncomeTax * 0.055; // 5.5% solidarity surcharge

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

  // Krankengeld is subject to social security contributions but not income tax
  const socialSecurityRate = 0.2025;
  const krankengeldNetAdjusted = Math.round(krankengeldNet * (1 - socialSecurityRate));

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
        backgroundColor: [
          "#3b82f6", // Full salary - blue
          "#f59e0b", // Krankengeld - amber
          "#ef4444", // Disability - red
          "#10b981", // With insurance - green
        ],
        borderColor: ["#1e40af", "#d97706", "#dc2626", "#059669"],
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
        backgroundColor: [
          "#93c5fd", // Light blue
          "#fcd34d", // Light amber
          "#fca5a5", // Light red
          "#86efac", // Light green
        ],
        borderColor: ["#1e40af", "#d97706", "#dc2626", "#059669"],
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
          color: "#1f2937",
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
          color: "#6b7280",
        },
        grid: { color: "#e5e7eb" },
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
        font: { size: 18, weight: "bold" },
        color: "#1f2937",
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#374151",
        borderWidth: 1,
        cornerRadius: 8,
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
