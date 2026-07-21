import { useEffect, useState } from "react";
import { RentencheckService } from "@/lib/services/rentencheck-service";

/** One income source row of the backend analysis (monthly € values). */
export interface PensionAnalysisRow {
  key: string;
  label: string;
  /** Stable grouping id from the engine: statutory | occupational | private | other. */
  group: "statutory" | "occupational" | "private" | "other";
  gross_today: number;
  gross_at_retirement: number;
  /** Taxable share in percent (Besteuerungsanteil / Ertragsanteil). */
  taxable_share: number;
  income_tax: number;
  church_tax: number;
  solidarity_surcharge: number;
  after_tax: number;
  health_care_insurance: number;
  after_insurance: number;
  purchasing_power: number;
}

export interface PensionAnalysisTotals {
  gross_at_retirement: number;
  income_tax: number;
  church_tax: number;
  solidarity_surcharge: number;
  after_tax: number;
  health_care_insurance: number;
  after_insurance: number;
  purchasing_power: number;
}

/**
 * Complete backend pension analysis (PensionCalculator::analyze()).
 *
 * Every displayed number comes from here — the frontend performs NO
 * pension math of its own.
 */
export interface PensionAnalysis {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  provisionEndAge: number;
  inflationRate: number;

  rows: PensionAnalysisRow[];
  totals: PensionAnalysisTotals;
  private_health_insurance: {
    monthly_today: number;
    monthly_at_retirement: number;
    purchasing_power: number;
  };

  desired_pension: { today: number; at_retirement: number };
  gap: { monthly_today: number; monthly_at_retirement: number; annual_at_retirement: number };
  capital: {
    years: number;
    total_payments: number;
    required_capital: number;
    remaining_capital: number;
  };
  disability: {
    net_income: number;
    sick_pay: number;
    emr_gross: number;
    emr_full_net: number;
    emr_half_net: number;
    private_disability_pension: number;
    emr_with_private_insurance: number;
  };

  parameters_used: {
    economic_assumptions: {
      inflation_rate: number;
      pension_increase_rate: number;
      investment_return_rate: number;
    };
    social_insurance: Record<string, number>;
    tax_system: Record<string, unknown>;
    regional_taxes: Record<string, number>;
    demographics: { retirement_age: number; life_expectancy: number };
  };
}

/**
 * Fetches the backend pension analysis for the given rentencheck.
 *
 * There is intentionally NO client-side fallback calculation: when the
 * backend is unavailable the consumers must render an error state instead
 * of silently inventing numbers.
 */
export function usePensionAnalysis(clientId?: number, rentencheckId?: number) {
  const [analysis, setAnalysis] = useState<PensionAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId || !rentencheckId) {
      setLoading(false);
      return;
    }

    let mounted = true;
    const fetchCalculation = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await RentencheckService.getPensionCalculation(clientId, rentencheckId);
        if (mounted) setAnalysis(response.pension_data as unknown as PensionAnalysis);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Unbekannter Fehler");
          setAnalysis(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCalculation();
    return () => {
      mounted = false;
    };
  }, [clientId, rentencheckId]);

  return { analysis, loading, error };
}
