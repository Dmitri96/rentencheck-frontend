import { api } from "@/lib/api";

interface PensionParameters {
  economic_assumptions: {
    inflation_rate: number;
    pension_increase_rate: number;
    investment_return_rate: number;
  };
  social_insurance: {
    health_insurance_rate: number;
    additional_health_insurance_rate: number;
    care_insurance_rate: number;
    total_insurance_rate: number;
    health_insurance_exemption_bav: number;
  };
  tax_system: {
    rates: Record<string, number>;
    thresholds: Record<string, number>;
    solidarity_surcharge_rate: number;
    solidarity_surcharge_threshold: number;
  };
}

const DEFAULTS: PensionParameters = {
  economic_assumptions: {
    inflation_rate: 2.0,
    pension_increase_rate: 1.0,
    investment_return_rate: 3.0,
  },
  social_insurance: {
    health_insurance_rate: 7.3,
    additional_health_insurance_rate: 1.25,
    care_insurance_rate: 3.6,
    total_insurance_rate: 12.15,
    health_insurance_exemption_bav: 187.25,
  },
  tax_system: {
    rates: {
      stufe_1: 0.0,
      stufe_2: 14.0,
      stufe_3: 24.0,
      stufe_4: 42.0,
      stufe_5: 45.0,
    },
    thresholds: {
      threshold_1: 12097.0,
      threshold_2: 17444.0,
      threshold_3: 68481.0,
      threshold_4: 277826.0,
    },
    solidarity_surcharge_rate: 5.5,
    solidarity_surcharge_threshold: 19450.0,
  },
};

class PensionParametersService {
  /**
   * Fetch advisor-readable pension parameters from the backend.
   * Falls back to hard-coded defaults if the request fails so chart
   * components can still render without a network round-trip.
   */
  async getPensionParameters(): Promise<PensionParameters> {
    try {
      const { data, error } = await api.GET("/pension-parameters");

      if (error) {
        console.warn("Failed to fetch dynamic pension parameters, using defaults:", error);
        return DEFAULTS;
      }

      const params = data.data.parameters;

      return {
        economic_assumptions: {
          inflation_rate: params.economic_assumptions.inflation_rate,
          pension_increase_rate: params.economic_assumptions.pension_increase_rate,
          investment_return_rate: params.economic_assumptions.investment_return_rate,
        },
        social_insurance: {
          health_insurance_rate: params.social_insurance.health_insurance_rate,
          additional_health_insurance_rate:
            params.social_insurance.additional_health_insurance_rate,
          care_insurance_rate: params.social_insurance.care_insurance_rate,
          total_insurance_rate: params.social_insurance.total_insurance_rate,
          health_insurance_exemption_bav: params.social_insurance.health_insurance_exemption_bav,
        },
        tax_system: {
          rates: params.tax_system.rates,
          thresholds: params.tax_system.thresholds,
          solidarity_surcharge_rate: params.tax_system.solidarity_surcharge_rate,
          solidarity_surcharge_threshold: params.tax_system.solidarity_surcharge_threshold,
        },
      };
    } catch (error) {
      console.warn("Failed to fetch dynamic pension parameters, using defaults:", error);
      return DEFAULTS;
    }
  }
}

export const pensionParametersService = new PensionParametersService();
export type { PensionParameters };
