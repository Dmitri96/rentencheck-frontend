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
   *
   * TODO Wave 3C: schema typed as `string` for /pension-parameters 200 response.
   * Once backend annotations land, replace the `as unknown` cast below.
   */
  async getPensionParameters(): Promise<PensionParameters> {
    try {
      const { data, error } = await api.GET("/pension-parameters");

      if (error) {
        console.warn("Failed to fetch dynamic pension parameters, using defaults:", error);
        return DEFAULTS;
      }

      // TODO Wave 3C: schema returns `string` for this endpoint; real shape is the object below.
      const payload = data as unknown as {
        success?: boolean;
        data?: PensionParameters;
        current_parameters?: PensionParameters;
      };

      if (!payload.success) {
        console.warn("Pension parameters API returned success=false, using defaults");
        return DEFAULTS;
      }

      return payload.data ?? DEFAULTS;
    } catch (error) {
      console.warn("Failed to fetch dynamic pension parameters, using defaults:", error);
      return DEFAULTS;
    }
  }
}

export const pensionParametersService = new PensionParametersService();
export type { PensionParameters };
