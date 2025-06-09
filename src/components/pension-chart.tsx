import React from "react";
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
import { PensionData } from "@/types/PensionData";

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
  data: PensionData;
}

const formatNumber = (value: number) => {
  return `${value.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;
};

const calculateFutureValueOfAnnuity = (
  monthlyPayment: number,
  annualInterestRate: number,
  years: number,
): number => {
  // Convert annual interest rate to monthly
  const monthlyRate = annualInterestRate / 12 / 100;
  const numberOfPayments = years * 12;

  // Future Value of Annuity formula: PMT * (((1 + r)^n - 1) / r)
  // where: PMT = monthly payment
  //        r = monthly interest rate
  //        n = total number of payments
  const futureValue =
    monthlyPayment *
    ((Math.pow(1 + monthlyRate, numberOfPayments) - 1) / monthlyRate);

  return futureValue;
};

export function PensionChart({ data }: PensionChartProps) {
  const years = Array.from(
    { length: data.lifeExpectancy - data.currentAge + 1 },
    (_, i) => data.currentAge + i,
  );

  // Key points for the chart
  const keyPoints = [
    {
      age: data.currentAge,
      desired: data.desiredPensionToday,
      total:
        data.privatePensionToday +
        data.legalPensionToday +
        data.bavRiesterToday,
      legal: data.legalPensionToday,
      private: data.privatePensionToday,
      bavRiester: data.bavRiesterToday,
    },
    {
      age: data.retirementAge,
      desired: data.desiredPensionRetirement,
      total:
        data.privatePensionRetirement +
        data.legalPensionRetirement +
        data.bavRiesterRetirement,
      legal: data.legalPensionRetirement,
      private: data.privatePensionRetirement,
      bavRiester: data.bavRiesterRetirement,
    },
    {
      age: data.lifeExpectancy,
      desired: data.desiredPensionLifeExpectancy,
      total: 0,
      legal: 0,
      private: 0,
      bavRiester: 0,
    },
  ];

  // Helper function to interpolate values between key points
  const interpolateValue = (
    year: number,
    values: { age: number; value: number }[],
  ) => {
    const sortedValues = values.sort((a, b) => a.age - b.age);

    // Find the two points to interpolate between
    const startPoint = sortedValues.find((point) => point.age <= year);
    const endPoint = sortedValues.find((point) => point.age >= year);

    if (!startPoint || !endPoint) {
      return 0;
    }

    if (startPoint.age === endPoint.age) {
      return startPoint.value;
    }

    // Linear interpolation
    const progress = (year - startPoint.age) / (endPoint.age - startPoint.age);
    return startPoint.value + (endPoint.value - startPoint.value) * progress;
  };

  const chartData = {
    labels: years,
    datasets: [
      {
        label: "Legal Pension",
        data: years.map((year) =>
          year >= data.currentAge && year <= data.retirementAge
            ? interpolateValue(
                year,
                keyPoints.map((point) => ({
                  age: point.age,
                  value: point.legal,
                })),
              )
            : null,
        ),
        borderColor: "rgb(255, 159, 64)",
        tension: 0.1,
        pointRadius: years.map((year) =>
          [data.currentAge, data.retirementAge].includes(year) ? 4 : 0,
        ),
        fill: false,
        order: 5,
      },
      {
        label: "Private Pension",
        data: years.map((year) =>
          year >= data.currentAge && year <= data.retirementAge
            ? interpolateValue(
                year,
                keyPoints.map((point) => ({
                  age: point.age,
                  value: point.legal + point.private,
                })),
              )
            : null,
        ),
        borderColor: "rgb(54, 162, 235)",
        tension: 0.1,
        pointRadius: years.map((year) =>
          [data.currentAge, data.retirementAge].includes(year) ? 4 : 0,
        ),
        fill: false,
        order: 4,
      },
      {
        label: "BAV/Riester",
        data: years.map((year) =>
          year >= data.currentAge && year <= data.retirementAge
            ? interpolateValue(
                year,
                keyPoints.map((point) => ({
                  age: point.age,
                  value: point.legal + point.private + point.bavRiester,
                })),
              )
            : null,
        ),
        borderColor: "rgb(153, 102, 255)",
        tension: 0.1,
        pointRadius: years.map((year) =>
          [data.currentAge, data.retirementAge].includes(year) ? 4 : 0,
        ),
        fill: false,
        order: 3,
      },
      {
        label: "Desired Pension",
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
          [data.currentAge, data.retirementAge, data.lifeExpectancy].includes(
            year,
          )
            ? 4
            : 0,
        ),
        fill: false,
        order: 2,
      },
      {
        label: "Total Available Pension",
        data: years.map((year) =>
          year >= data.currentAge && year <= data.retirementAge
            ? interpolateValue(
                year,
                keyPoints.map((point) => ({
                  age: point.age,
                  value: point.total,
                })),
              )
            : null,
        ),
        borderColor: "rgb(75, 192, 75)",
        tension: 0.1,
        pointRadius: years.map((year) =>
          [data.currentAge, data.retirementAge].includes(year) ? 4 : 0,
        ),
        fill: false,
        order: 1,
      },
      {
        label: "Retirement Area",
        data: years.map((year) =>
          year >= data.retirementAge && year <= data.lifeExpectancy
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
        order: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
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
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          callback: function (value: any) {
            const age = years[value];
            return [
              data.currentAge,
              data.retirementAge,
              data.lifeExpectancy,
            ].includes(age)
              ? `age ${age}`
              : "";
          },
        },
      },
    },
    plugins: [
      {
        id: "chartLabels",
        beforeDraw: (chart: any) => {
          const ctx = chart.ctx;
          const xAxis = chart.scales.x;
          const yAxis = chart.scales.y;
          const chartArea = chart.chartArea;

          // Draw vertical lines at key points
          ctx.save();
          ctx.strokeStyle = "black";
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]); // Make lines dashed

          // Today line
          const xCurrentAge = xAxis.getPixelForValue(
            years.indexOf(data.currentAge),
          );
          ctx.beginPath();
          ctx.moveTo(xCurrentAge, chartArea.bottom);
          ctx.lineTo(xCurrentAge, chartArea.top);
          ctx.stroke();

          // Retirement line
          const xRetirement = xAxis.getPixelForValue(
            years.indexOf(data.retirementAge),
          );
          ctx.beginPath();
          ctx.moveTo(xRetirement, chartArea.bottom);
          ctx.lineTo(xRetirement, chartArea.top);
          ctx.stroke();

          // Life expectancy line
          const xLifeExpectancy = xAxis.getPixelForValue(
            years.indexOf(data.lifeExpectancy),
          );
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

          ctx.save();
          ctx.font = "10px Arial";

          // Current Age values
          const currentAgeIndex = years.indexOf(data.currentAge);
          const xCurrentAge = xAxis.getPixelForValue(currentAgeIndex);

          ctx.fillStyle = "rgb(75, 192, 192)";
          ctx.fillText(
            formatNumber(data.desiredPensionToday),
            xCurrentAge - 25,
            yAxis.getPixelForValue(data.desiredPensionToday) - 10,
          );

          ctx.fillStyle = "rgb(75, 192, 75)";
          const totalToday =
            data.legalPensionToday +
            data.privatePensionToday +
            data.bavRiesterToday;
          ctx.fillText(
            formatNumber(totalToday),
            xCurrentAge - 25,
            yAxis.getPixelForValue(totalToday) - 10,
          );

          ctx.fillStyle = "rgb(255, 159, 64)";
          ctx.fillText(
            formatNumber(data.legalPensionToday),
            xCurrentAge - 25,
            yAxis.getPixelForValue(data.legalPensionToday) - 10,
          );

          ctx.fillStyle = "rgb(153, 102, 255)";
          ctx.fillText(
            formatNumber(data.bavRiesterToday),
            xCurrentAge - 25,
            yAxis.getPixelForValue(
              data.legalPensionToday +
                data.privatePensionToday +
                data.bavRiesterToday,
            ) - 10,
          );

          // Retirement Age values
          const retirementAgeIndex = years.indexOf(data.retirementAge);
          const xRetirement = xAxis.getPixelForValue(retirementAgeIndex);

          ctx.fillStyle = "rgb(75, 192, 192)";
          ctx.fillText(
            formatNumber(data.desiredPensionRetirement),
            xRetirement - 25,
            yAxis.getPixelForValue(data.desiredPensionRetirement) - 10,
          );

          ctx.fillStyle = "rgb(75, 192, 75)";
          const totalRetirement =
            data.legalPensionRetirement +
            data.privatePensionRetirement +
            data.bavRiesterRetirement;
          ctx.fillText(
            formatNumber(totalRetirement),
            xRetirement - 25,
            yAxis.getPixelForValue(totalRetirement) - 10,
          );

          ctx.fillStyle = "rgb(255, 159, 64)";
          ctx.fillText(
            formatNumber(data.legalPensionRetirement),
            xRetirement - 25,
            yAxis.getPixelForValue(data.legalPensionRetirement) - 10,
          );

          ctx.fillStyle = "rgb(153, 102, 255)";
          ctx.fillText(
            formatNumber(data.bavRiesterRetirement),
            xRetirement - 25,
            yAxis.getPixelForValue(
              data.legalPensionRetirement +
                data.privatePensionRetirement +
                data.bavRiesterRetirement,
            ) - 10,
          );

          // Life Expectancy value
          const lifeExpectancyIndex = years.indexOf(data.lifeExpectancy);
          const xLifeExpectancy = xAxis.getPixelForValue(lifeExpectancyIndex);

          ctx.fillStyle = "rgb(75, 192, 192)";
          ctx.fillText(
            formatNumber(data.desiredPensionLifeExpectancy),
            xLifeExpectancy - 25,
            yAxis.getPixelForValue(data.desiredPensionLifeExpectancy) - 10,
          );

          ctx.restore();
        },
      },
    ],
  };

  const totalPensionRetirement =
    data.legalPensionRetirement +
    data.privatePensionRetirement +
    data.bavRiesterRetirement;
  const missingAmount = data.desiredPensionRetirement - totalPensionRetirement;

  // Calculate total needed amount for retirement period using compound interest
  const yearsInRetirement = data.lifeExpectancy - data.retirementAge;
  const annualInterestRate = 2; // Assuming 2% annual interest rate for inflation adjustment
  const totalNeededAmount = calculateFutureValueOfAnnuity(
    missingAmount,
    annualInterestRate,
    yearsInRetirement,
  );

  return (
    <div>
      <div style={{ height: "400px" }}>
        <Line data={chartData} options={options} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-red-800">
            Versorgungslücke bei Renteneintritt
          </h3>
          <p className="text-2xl font-bold text-red-600">
            {formatNumber(missingAmount)}
          </p>
          <p className="text-xs text-red-600">monatlich</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800">
            Rentenzahlungen aus Fehlbetrag
          </h3>
          <p className="text-2xl font-bold text-blue-600">
            {formatNumber(totalNeededAmount)}
          </p>
          <p className="text-xs text-blue-600">
            Gesamtbetrag mit {annualInterestRate}% Verzinsung p.a.
          </p>
        </div>
      </div>
    </div>
  );
}
