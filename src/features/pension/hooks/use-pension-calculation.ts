import { useEffect, useState } from "react";
import { RentencheckService } from "@/lib/services/rentencheck-service";

export interface PensionData {
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
      pension_increase_rate?: number;
    };
    social_insurance: {
      health_insurance_rate: number;
      care_insurance_rate: number;
      total_insurance_rate: number;
    };
  };
  isBackendCalculation: boolean;
}

/**
 * Fetches the backend pension analysis for the given rentencheck and folds it
 * into the chart-ready PensionData shape. Loading + error states are local.
 *
 * Extracted from pension-chart.tsx (was 55 LOC embedded). Phase 8 task #2 of
 * the audit: make charts testable independent of the backend HTTP fetch.
 */
export function usePensionCalculation(
  clientId?: number,
  rentencheckId?: number,
  desiredPension?: number,
) {
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

        const cleanData: PensionData = {
          currentAge: backendData.currentAge,
          retirementAge: backendData.retirementAge,
          lifeExpectancy: backendData.lifeExpectancy,
          inflationRate: backendData.inflationRate,
          statutoryPensionGross: backendData.statutoryPensionGross,
          statutoryPensionAfterInsurance: backendData.statutoryPensionAfterInsurance,
          privatePensionToday: backendData.privatePensionToday,
          bavRiesterToday: backendData.bavRiesterToday,
          currentPensionGap: Math.max(
            0,
            desiredPension -
              (backendData.statutoryPensionAfterInsurance +
                backendData.privatePensionToday +
                backendData.bavRiesterToday),
          ),
          parameters: backendData.parameters_used,
          isBackendCalculation: true,
        };

        setPensionData(cleanData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unbekannter Fehler");
        setPensionData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCalculation();
  }, [clientId, rentencheckId, desiredPension]);

  return { pensionData, loading, error };
}
