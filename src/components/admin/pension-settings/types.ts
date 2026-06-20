/**
 * TypeScript-Typen für das Pensionseinstellungen-Panel
 *
 * Definiert alle Schnittstellen und Typen für die Verwaltung
 * deutscher Rentenberechnungsparameter.
 */

export interface PensionSetting {
  id: number;
  key: string;
  value: number;
  unit: string;
  description: string;
  description_de: string;
  formatted_value: string;
}

export interface PensionSettings {
  social_insurance: PensionSetting[];
  economic_assumptions: PensionSetting[];
  tax_brackets: PensionSetting[];
  tax_thresholds: PensionSetting[];
  regional_taxes: PensionSetting[];
}

export interface PensionParameters {
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

export interface ModifiedValues {
  [settingId: number]: number;
}

export interface CategoryConfig {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}
