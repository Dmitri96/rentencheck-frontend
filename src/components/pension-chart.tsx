import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { Rentencheck } from "@/lib/services/rentencheck-service";
import { RentencheckService } from "@/lib/services/rentencheck-service";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

interface PensionChartProps {
  data: Rentencheck;
  desiredPension: number;
}

interface PensionData {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  inflationRate: number;
  statutoryPensionGross: number;
  statutoryPensionAfterInsurance: number;
  privatePensionToday: number;
  bavRiesterToday: number;
  currentPensionGap: number;
  parameters: {
    economic_assumptions: {
      inflation_rate: number;
      investment_return_rate: number;
    };
    social_insurance: {
      health_insurance_rate: number;
      care_insurance_rate: number;
      total_insurance_rate: number;
    };
  };
  isBackendCalculation: boolean;
}

const formatNumber = (value: number) => {
  return `${value.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;
};

/**
 * Hook to fetch pension calculation data from backend using dynamic admin parameters
 */
function usePensionCalculation(clientId?: number, rentencheckId?: number, desiredPension?: number) {
  const [pensionData, setPensionData] = useState<PensionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId || !rentencheckId || !desiredPension) return;

    const fetchCalculation = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await RentencheckService.getPensionCalculation(clientId, rentencheckId);
        const backendData = response.pension_data;
        
        // Transform backend data to our clean interface
        const cleanData: PensionData = {
          currentAge: backendData.currentAge,
          retirementAge: backendData.retirementAge,
          lifeExpectancy: backendData.lifeExpectancy,
          inflationRate: backendData.inflationRate,
          statutoryPensionGross: backendData.statutoryPensionGross,
          statutoryPensionAfterInsurance: backendData.statutoryPensionAfterInsurance,
          privatePensionToday: backendData.privatePensionToday,
          bavRiesterToday: backendData.bavRiesterToday,
          currentPensionGap: Math.max(0, desiredPension - (backendData.statutoryPensionAfterInsurance + backendData.privatePensionToday + backendData.bavRiesterToday)),
          parameters: backendData.parameters_used,
          isBackendCalculation: true,
        };
        
        setPensionData(cleanData);
        console.log("✅ Using Backend Calculation with Dynamic Admin Parameters:", cleanData.parameters);
      } catch (err) {
        console.warn("Backend calculation failed, will use fallback:", err);
        setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
        setPensionData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCalculation();
  }, [clientId, rentencheckId, desiredPension]);

  return { pensionData, loading, error };
}

export function PensionChart({ data, desiredPension }: PensionChartProps) {
  const clientId = data.client_id;
  const rentencheckId = data.id;
  
  // Try to get backend calculation data with dynamic parameters
  const { pensionData, loading, error } = usePensionCalculation(clientId, rentencheckId, desiredPension);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Berechnung mit aktuellen Admin-Parametern...</p>
        </div>
      </div>
    );
  }

  if (pensionData) {
    // Render with backend calculation data
    return renderChart(pensionData, desiredPension);
  }

  // Fallback: create pension data from frontend
  const fallbackData = createFallbackPensionData(data, desiredPension);
  return renderChart(fallbackData, desiredPension);
}

/**
 * Create fallback pension data when backend calculation is not available
 */
function createFallbackPensionData(data: Rentencheck, desiredPension: number): PensionData {
  const currentAge = data.step_2_data?.currentAge || 30;
  const retirementAge = data.step_2_data?.retirementAge || 67;
  const lifeExpectancy = 85; // Realistic German life expectancy
  
  // Use hardcoded fallback parameters
  const fallbackParameters = {
    economic_assumptions: {
      inflation_rate: 2.0,
      investment_return_rate: 3.0,
    },
    social_insurance: {
      health_insurance_rate: 7.3,
      care_insurance_rate: 3.6,
      total_insurance_rate: 12.15,
    },
  };

  // Simple fallback calculations
  const statutoryPensionGross = 800; // Simplified fallback
  const statutoryPensionAfterInsurance = statutoryPensionGross * (1 - fallbackParameters.social_insurance.total_insurance_rate / 100);
  const privatePensionToday = 200; // Simplified fallback
  const bavRiesterToday = 150; // Simplified fallback
  const totalAvailable = statutoryPensionAfterInsurance + privatePensionToday + bavRiesterToday;

  return {
    currentAge,
    retirementAge,
    lifeExpectancy,
    inflationRate: fallbackParameters.economic_assumptions.inflation_rate,
    statutoryPensionGross,
    statutoryPensionAfterInsurance,
    privatePensionToday,
    bavRiesterToday,
    currentPensionGap: Math.max(0, desiredPension - totalAvailable),
    parameters: fallbackParameters,
    isBackendCalculation: false,
  };
}

/**
 * Render the pension chart with calculated data
 */
function renderChart(pensionData: PensionData, desiredPension: number) {
  const {
    currentAge,
    retirementAge,
    lifeExpectancy,
    inflationRate,
    statutoryPensionGross,
    statutoryPensionAfterInsurance,
    privatePensionToday,
    bavRiesterToday,
    currentPensionGap,
    parameters,
    isBackendCalculation
  } = pensionData;

  const INFLATION_RATE = inflationRate / 100;
  const yearsToRetirement = retirementAge - currentAge;
  const totalAvailablePension = statutoryPensionAfterInsurance + privatePensionToday + bavRiesterToday;
  const gapAtRetirement = currentPensionGap * Math.pow(1 + INFLATION_RATE, yearsToRetirement);

  // Generate years array for chart
  const years = Array.from(
    { length: lifeExpectancy - currentAge + 1 },
    (_, i) => currentAge + i,
  );

  // Key points for the chart calculations
  const keyPoints = [
    {
      age: currentAge,
      desired: desiredPension,
      available: totalAvailablePension,
      gap: currentPensionGap,
      statutory: statutoryPensionAfterInsurance,
      private: privatePensionToday + bavRiesterToday,
    },
    {
      age: retirementAge,
      desired: desiredPension * Math.pow(1 + INFLATION_RATE, yearsToRetirement),
      available: totalAvailablePension * Math.pow(1 + INFLATION_RATE, yearsToRetirement),
      gap: gapAtRetirement,
      statutory: statutoryPensionAfterInsurance * Math.pow(1 + INFLATION_RATE, yearsToRetirement),
      private: (privatePensionToday + bavRiesterToday) * Math.pow(1 + INFLATION_RATE, yearsToRetirement),
    },
    {
      age: lifeExpectancy,
      desired: desiredPension * Math.pow(1 + INFLATION_RATE, lifeExpectancy - currentAge),
      available: totalAvailablePension * Math.pow(1 + INFLATION_RATE, lifeExpectancy - currentAge),
      gap: currentPensionGap * Math.pow(1 + INFLATION_RATE, lifeExpectancy - currentAge),
      statutory: statutoryPensionAfterInsurance * Math.pow(1 + INFLATION_RATE, lifeExpectancy - currentAge),
      private: (privatePensionToday + bavRiesterToday) * Math.pow(1 + INFLATION_RATE, lifeExpectancy - currentAge),
    },
  ];

  // Helper function to interpolate values between key points
  const interpolateValue = (
    year: number,
    values: { age: number; value: number }[],
  ) => {
    const sortedValues = values.sort((a, b) => a.age - b.age);
    const startPoint = sortedValues.find((point) => point.age <= year);
    const endPoint = sortedValues.find((point) => point.age >= year);

    if (!startPoint || !endPoint) return 0;
    if (startPoint.age === endPoint.age) return startPoint.value;

    const progress = (year - startPoint.age) / (endPoint.age - startPoint.age);
    return startPoint.value + (endPoint.value - startPoint.value) * progress;
  };

  // Chart data configuration
  const chartData = {
    labels: years,
    datasets: [
      {
        label: "Gesetzliche Rente",
        data: years.map((year) =>
          year >= currentAge && year <= retirementAge
            ? interpolateValue(
                year,
                keyPoints.map((point) => ({
                  age: point.age,
                  value: point.statutory,
                })),
              )
            : null,
        ),
        borderColor: "rgb(255, 159, 64)",
        tension: 0.1,
        pointRadius: years.map((year) =>
          [currentAge, retirementAge].includes(year) ? 4 : 0,
        ),
        fill: false,
        order: 4,
      },
      {
        label: "Private Rente",
        data: years.map((year) =>
          year >= currentAge && year <= retirementAge
            ? interpolateValue(
                year,
                keyPoints.map((point) => ({
                  age: point.age,
                  value: point.statutory + point.private,
                })),
              )
            : null,
        ),
        borderColor: "rgb(54, 162, 235)",
        tension: 0.1,
        pointRadius: years.map((year) =>
          [currentAge, retirementAge].includes(year) ? 4 : 0,
        ),
        fill: false,
        order: 3,
      },
      {
        label: "Rentenwunsch",
        data: years.map((year) =>
          interpolateValue(
            year,
            keyPoints.map((point) => ({
              age: point.age,
              value: point.desired,
            })),
          ),
        ),
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
        pointRadius: years.map((year) =>
          [currentAge, retirementAge, lifeExpectancy].includes(year) ? 4 : 0,
        ),
        fill: false,
        order: 2,
      },
      {
        label: "Verfügbare Rente",
        data: years.map((year) =>
          year >= currentAge && year <= retirementAge
            ? interpolateValue(
                year,
                keyPoints.map((point) => ({
                  age: point.age,
                  value: point.available,
                })),
              )
            : null,
        ),
        borderColor: "rgb(75, 192, 75)",
        tension: 0.1,
        pointRadius: years.map((year) =>
          [currentAge, retirementAge].includes(year) ? 4 : 0,
        ),
        fill: false,
        order: 1,
      },
      {
        label: "Versorgungslücke",
        data: years.map((year) => {
          if (year < retirementAge || year > lifeExpectancy) return null;
          
          const desired = interpolateValue(
            year,
            keyPoints.map((point) => ({
              age: point.age,
              value: point.desired,
            })),
          );
          
          const available = interpolateValue(
            year,
            keyPoints.map((point) => ({
              age: point.age,
              value: point.available,
            })),
          );
          
          return Math.max(0, desired - available);
        }),
        backgroundColor: "rgba(239, 68, 68, 0.3)",
        borderColor: "rgba(239, 68, 68, 0.8)",
        borderWidth: 2,
        fill: true,
        pointRadius: 0,
        order: 6,
      },
      {
        label: "Rentenzeit",
        data: years.map((year) =>
          year >= retirementAge && year <= lifeExpectancy
            ? interpolateValue(
                year,
                keyPoints.map((point) => ({
                  age: point.age,
                  value: point.desired,
                })),
              )
            : null,
        ),
        backgroundColor: "rgba(200, 200, 200, 0.2)",
        borderColor: "transparent",
        fill: true,
        pointRadius: 0,
        order: 5,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 40,
        bottom: 60,
        left: 40,
        right: 40,
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          boxWidth: 8,
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      y: {
        display: false,
        beginAtZero: true,
        grace: '10%',
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          callback: function (value: any) {
            const age = years[value];
            return [currentAge, retirementAge, lifeExpectancy].includes(age)
              ? `${age}`
              : "";
          },
          maxTicksLimit: 10,
          padding: 10,
        },
      },
    },
  };

  // Chart plugins for custom drawing
  const chartPlugins = [
    {
      id: "chartLabels",
      beforeDraw: (chart: any) => {
        const ctx = chart.ctx;
        const xAxis = chart.scales.x;
        const chartArea = chart.chartArea;

        ctx.save();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);

        // Today line
        const xCurrentAge = xAxis.getPixelForValue(years.indexOf(currentAge));
        ctx.beginPath();
        ctx.moveTo(xCurrentAge, chartArea.bottom);
        ctx.lineTo(xCurrentAge, chartArea.top);
        ctx.stroke();

        // Retirement line
        const xRetirement = xAxis.getPixelForValue(years.indexOf(retirementAge));
        ctx.beginPath();
        ctx.moveTo(xRetirement, chartArea.bottom);
        ctx.lineTo(xRetirement, chartArea.top);
        ctx.stroke();

        // Life expectancy line
        const xLifeExpectancy = xAxis.getPixelForValue(years.indexOf(lifeExpectancy));
        ctx.beginPath();
        ctx.moveTo(xLifeExpectancy, chartArea.bottom);
        ctx.lineTo(xLifeExpectancy, chartArea.top);
        ctx.stroke();

        ctx.restore();
      },
      afterDraw: (chart: any) => {
        const ctx = chart.ctx;
        const xAxis = chart.scales.x;
        const yAxis = chart.scales.y;
        const chartArea = chart.chartArea;

        ctx.save();
        ctx.font = "10px Arial";

        // Current Age values
        const currentAgeIndex = years.indexOf(currentAge);
        const xCurrentAge = xAxis.getPixelForValue(currentAgeIndex);

        ctx.fillStyle = "rgb(75, 192, 192)";
        ctx.fillText(
          formatNumber(desiredPension),
          Math.max(10, xCurrentAge - 40),
          Math.max(20, yAxis.getPixelForValue(desiredPension) - 15),
        );

        ctx.fillStyle = "rgb(75, 192, 75)";
        ctx.fillText(
          formatNumber(totalAvailablePension),
          Math.max(10, xCurrentAge - 40),
          Math.max(35, yAxis.getPixelForValue(totalAvailablePension) + 15),
        );

        // Retirement Age values
        const retirementAgeIndex = years.indexOf(retirementAge);
        const xRetirement = xAxis.getPixelForValue(retirementAgeIndex);

        const desiredAtRetirement = desiredPension * Math.pow(1 + INFLATION_RATE, yearsToRetirement);
        const availableAtRetirement = totalAvailablePension * Math.pow(1 + INFLATION_RATE, yearsToRetirement);

        ctx.fillStyle = "rgb(75, 192, 192)";
        ctx.fillText(
          formatNumber(desiredAtRetirement),
          Math.max(10, xRetirement - 40),
          Math.max(20, yAxis.getPixelForValue(desiredAtRetirement) - 15),
        );

        ctx.fillStyle = "rgb(75, 192, 75)";
        ctx.fillText(
          formatNumber(availableAtRetirement),
          Math.max(10, xRetirement - 40),
          Math.max(35, yAxis.getPixelForValue(availableAtRetirement) + 15),
        );

        // Life Expectancy value
        const lifeExpectancyIndex = years.indexOf(lifeExpectancy);
        const xLifeExpectancy = xAxis.getPixelForValue(lifeExpectancyIndex);

        const desiredAtLifeExpectancy = desiredPension * Math.pow(1 + INFLATION_RATE, lifeExpectancy - currentAge);

        ctx.fillStyle = "rgb(75, 192, 192)";
        ctx.fillText(
          formatNumber(desiredAtLifeExpectancy),
          Math.min(chartArea.right - 100, xLifeExpectancy - 40),
          Math.max(20, yAxis.getPixelForValue(desiredAtLifeExpectancy) - 15),
        );

        // Add age labels with better positioning
        ctx.fillStyle = "black";
        ctx.font = "12px Arial";
        
        ctx.fillText(`${currentAge}`, Math.max(5, xCurrentAge - 10), chartArea.bottom + 15);
        ctx.fillText(`${retirementAge}`, Math.max(5, xRetirement - 10), chartArea.bottom + 15);
        ctx.fillText(`${lifeExpectancy}`, Math.min(chartArea.right - 20, xLifeExpectancy - 10), chartArea.bottom + 15);
        
        // Add descriptive labels with better positioning
        ctx.font = "10px Arial";
        ctx.fillStyle = "gray";
        ctx.fillText("Heute", Math.max(0, xCurrentAge - 15), chartArea.bottom + 30);
        ctx.fillText("Renteneintritt", Math.max(0, xRetirement - 30), chartArea.bottom + 30);
        ctx.fillText("Lebensalter", Math.min(chartArea.right - 60, xLifeExpectancy - 25), chartArea.bottom + 30);

        ctx.restore();
      },
    },
  ];

  return (
    <div className="w-full">
      {/* Calculation Source Indicator */}
      <div className={`p-4 rounded-lg border mb-6 ${isBackendCalculation ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
        <h3 className={`text-lg font-semibold mb-2 ${isBackendCalculation ? 'text-green-800' : 'text-yellow-800'}`}>
          {isBackendCalculation ? '✅ Backend-Berechnung mit dynamischen Admin-Parametern' : '⚠️ Fallback-Berechnung (Frontend)'}
        </h3>
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <span className="block font-medium">Inflation:</span>
              <span>{parameters.economic_assumptions.inflation_rate}%</span>
            </div>
            <div>
              <span className="block font-medium">Krankenversicherung:</span>
              <span>{parameters.social_insurance.health_insurance_rate}%</span>
            </div>
            <div>
              <span className="block font-medium">Pflegeversicherung:</span>
              <span>{parameters.social_insurance.care_insurance_rate}%</span>
            </div>
            <div>
              <span className="block font-medium">Kapitalrendite:</span>
              <span>{parameters.economic_assumptions.investment_return_rate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="w-full mb-8" style={{ height: "500px", padding: "20px" }}>
        <Line data={chartData} options={options} plugins={chartPlugins} />
      </div>

      {/* Analysis Table is handled by separate PensionResultsTable component elsewhere */}

      {/* Gap analysis boxes removed to keep single source of truth in table */}

      {/* Note box removed to reduce duplication and keep layout clean */}
    </div>
  );
}
