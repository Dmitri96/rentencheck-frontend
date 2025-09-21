"use client"

import { useState } from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { Line } from "react-chartjs-2"
import annotationPlugin from "chartjs-plugin-annotation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  annotationPlugin,
)

interface ChartData {
  year: number
  age: number
  desiredRent: number
  actualPension: number
  rentalIncome: number
  privatePension: number
  totalIncome: number
  gap: number
}

export default function PensionGapChartJS() {
  const [currentAge, setCurrentAge] = useState(30)
  const [retirementAge, setRetirementAge] = useState(67)
  const [lifeExpectancy, setLifeExpectancy] = useState(85)
  const [currentRent, setCurrentRent] = useState(1500)
  const [currentPension, setCurrentPension] = useState(1600)
  const [rentalIncome, setRentalIncome] = useState(400)
  const [privatePension, setPrivatePension] = useState(300)
  const [inflationRate, setInflationRate] = useState(2.0)
  const [pensionGrowthRate, setPensionGrowthRate] = useState(1.5)
  const [rentalGrowthRate, setRentalGrowthRate] = useState(2.5)
  const [privatePensionGrowthRate, setPrivatePensionGrowthRate] = useState(3.0)

  const generateChartData = (): ChartData[] => {
    const data: ChartData[] = []
    const currentYear = new Date().getFullYear()

    for (let age = currentAge; age <= lifeExpectancy; age++) {
      const yearsFromNow = age - currentAge
      const year = currentYear + yearsFromNow

      const desiredRent = currentRent * Math.pow(1 + inflationRate / 100, yearsFromNow)
      const actualPension = currentPension * Math.pow(1 + pensionGrowthRate / 100, yearsFromNow)
      const currentRentalIncome = rentalIncome * Math.pow(1 + rentalGrowthRate / 100, yearsFromNow)
      const currentPrivatePension = privatePension * Math.pow(1 + privatePensionGrowthRate / 100, yearsFromNow)
      const totalIncome = actualPension + currentRentalIncome + currentPrivatePension
      const gap = Math.max(0, desiredRent - totalIncome)

      data.push({
        year,
        age,
        desiredRent: Math.round(desiredRent),
        actualPension: Math.round(actualPension),
        rentalIncome: Math.round(currentRentalIncome),
        privatePension: Math.round(currentPrivatePension),
        totalIncome: Math.round(totalIncome),
        gap: Math.round(gap),
      })
    }

    return data
  }

  const chartData = generateChartData()
  const totalGap = chartData.filter((d) => d.age >= retirementAge).reduce((sum, d) => sum + d.gap, 0)

  const ages = chartData.map((d) => d.age)
  const retirementIndex = ages.indexOf(retirementAge)

  const chartConfig = {
    type: "line" as const,
    data: {
      labels: ages,
      datasets: [
        {
          label: "State Pension",
          data: chartData.map((d) => d.actualPension),
          backgroundColor: "rgba(22, 163, 74, 0.8)",
          borderColor: "rgba(22, 163, 74, 1)",
          borderWidth: 1,
          fill: true,
          tension: 0.1,
        },
        {
          label: "Rental Income",
          data: chartData.map((d, i) => d.actualPension + d.rentalIncome),
          backgroundColor: "rgba(147, 51, 234, 0.8)",
          borderColor: "rgba(147, 51, 234, 1)",
          borderWidth: 1,
          fill: "-1",
          tension: 0.1,
        },
        {
          label: "Private Pension",
          data: chartData.map((d, i) => d.actualPension + d.rentalIncome + d.privatePension),
          backgroundColor: "rgba(234, 88, 12, 0.8)",
          borderColor: "rgba(234, 88, 12, 1)",
          borderWidth: 1,
          fill: "-1",
          tension: 0.1,
        },
        {
          label: "Pension Gap",
          data: chartData.map((d) => d.desiredRent),
          backgroundColor: "rgba(220, 38, 38, 0.7)",
          borderColor: "rgba(220, 38, 38, 1)",
          borderWidth: 2,
          fill: "-1",
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index" as const,
        intersect: false,
      },
      plugins: {
        title: {
          display: true,
          text: "Pension Gap Analysis (Chart.js Version)",
          font: {
            size: 16,
            weight: "bold" as const,
          },
        },
        legend: {
          position: "top" as const,
        },
        tooltip: {
          callbacks: {
            afterBody: (context: any) => {
              const dataIndex = context[0].dataIndex
              const data = chartData[dataIndex]
              return [
                `Year: ${data.year}`,
                `Total Income: €${data.totalIncome.toLocaleString()}`,
                `Gap: €${data.gap.toLocaleString()}`,
              ]
            },
          },
        },
        annotation: {
          annotations: {
            retirementLine: {
              type: "line" as const,
              xMin: retirementIndex,
              xMax: retirementIndex,
              borderColor: "rgba(220, 38, 38, 0.8)",
              borderWidth: 3,
              borderDash: [5, 5],
              label: {
                display: true,
                content: "Retirement",
                position: "start" as const,
                backgroundColor: "rgba(220, 38, 38, 0.8)",
                color: "white",
                font: {
                  weight: "bold" as const,
                },
              },
            },
            gapLabel: {
              type: "label" as const,
              xValue: Math.floor((retirementIndex + ages.length) / 2),
              yValue: Math.max(...chartData.map((d) => d.desiredRent)) * 0.7,
              content: `Total Gap: €${totalGap.toLocaleString()}`,
              backgroundColor: "rgba(220, 38, 38, 0.9)",
              color: "white",
              font: {
                size: 16,
                weight: "bold" as const,
              },
              padding: 8,
              borderRadius: 4,
            },
          },
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "Age",
            font: {
              weight: "bold" as const,
            },
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: "Monthly Amount (€)",
            font: {
              weight: "bold" as const,
            },
          },
          ticks: {
            callback: (value: any) => "€" + value.toLocaleString(),
          },
        },
      },
    },
  }

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Chart.js Configuration</CardTitle>
          <CardDescription>Same parameters as Recharts version for comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentAge2">Current Age</Label>
              <Input
                id="currentAge2"
                type="number"
                value={currentAge}
                onChange={(e) => setCurrentAge(Number(e.target.value))}
                min="18"
                max="65"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="retirementAge2">Retirement Age</Label>
              <Input
                id="retirementAge2"
                type="number"
                value={retirementAge}
                onChange={(e) => setRetirementAge(Number(e.target.value))}
                min="60"
                max="70"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lifeExpectancy2">Life Expectancy</Label>
              <Input
                id="lifeExpectancy2"
                type="number"
                value={lifeExpectancy}
                onChange={(e) => setLifeExpectancy(Number(e.target.value))}
                min="70"
                max="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentRent2">Desired Rent (€)</Label>
              <Input
                id="currentRent2"
                type="number"
                value={currentRent}
                onChange={(e) => setCurrentRent(Number(e.target.value))}
                min="500"
                step="50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentPension2">State Pension (€)</Label>
              <Input
                id="currentPension2"
                type="number"
                value={currentPension}
                onChange={(e) => setCurrentPension(Number(e.target.value))}
                min="500"
                step="50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rentalIncome2">Rental Income (€)</Label>
              <Input
                id="rentalIncome2"
                type="number"
                value={rentalIncome}
                onChange={(e) => setRentalIncome(Number(e.target.value))}
                min="0"
                step="50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="privatePension2">Private Pension (€)</Label>
              <Input
                id="privatePension2"
                type="number"
                value={privatePension}
                onChange={(e) => setPrivatePension(Number(e.target.value))}
                min="0"
                step="50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inflationRate2">Inflation Rate (%)</Label>
              <Input
                id="inflationRate2"
                type="number"
                value={inflationRate}
                onChange={(e) => setInflationRate(Number(e.target.value))}
                min="0"
                max="10"
                step="0.1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Pension Gap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">€{totalGap.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Chart.js calculation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Gap at Retirement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              €{chartData.find((d) => d.age === retirementAge)?.gap.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">Monthly shortfall at age {retirementAge}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Monthly Income at Retirement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              €{chartData.find((d) => d.age === retirementAge)?.totalIncome.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">All income sources combined</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart.js Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Chart.js Pension Gap Visualization</CardTitle>
          <CardDescription>Enhanced version with better annotation support and custom text positioning</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[500px]">
            <Line data={chartConfig.data} options={chartConfig.options} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
