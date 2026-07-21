import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { usePensionAnalysis } from "./use-pension-analysis";
import { RentencheckService } from "@/lib/services/rentencheck-service";

vi.mock("@/lib/services/rentencheck-service", () => ({
  RentencheckService: {
    getPensionCalculation: vi.fn(),
  },
}));

// Shape mirrors PensionCalculator::analyze() — the hook passes it through untouched.
const MOCK_ANALYSIS = {
  currentAge: 48,
  retirementAge: 67,
  lifeExpectancy: 85,
  provisionEndAge: 92,
  inflationRate: 2,
  rows: [
    {
      key: "statutory",
      label: "Gesetzl. Versorgung (inkl. Rentensteigerung)",
      gross_today: 1000,
      gross_at_retirement: 1208.11,
      taxable_share: 83.5,
      income_tax: 0,
      church_tax: 0,
      solidarity_surcharge: 0,
      after_tax: 1208.11,
      health_care_insurance: 146.79,
      after_insurance: 1061.32,
      purchasing_power: 728.52,
    },
  ],
  totals: {
    gross_at_retirement: 1208.11,
    income_tax: 0,
    church_tax: 0,
    solidarity_surcharge: 0,
    after_tax: 1208.11,
    health_care_insurance: 146.79,
    after_insurance: 1061.32,
    purchasing_power: 728.52,
  },
  private_health_insurance: { monthly_today: 0, monthly_at_retirement: 0, purchasing_power: 0 },
  desired_pension: { today: 1500, at_retirement: 2185.22 },
  gap: { monthly_today: 771.48, monthly_at_retirement: 1123.9, annual_at_retirement: 13486.8 },
  capital: { years: 25, total_payments: 431900, required_capital: 291200, remaining_capital: 0 },
  disability: {
    net_income: 2600,
    sick_pay: 2340,
    emr_gross: 1400,
    emr_full_net: 1229.9,
    emr_half_net: 614.95,
    private_disability_pension: 0,
    emr_with_private_insurance: 1229.9,
  },
  parameters_used: {
    economic_assumptions: {
      inflation_rate: 2,
      pension_increase_rate: 1,
      investment_return_rate: 3,
    },
    social_insurance: { total_insurance_rate: 12.15 },
    tax_system: {},
    regional_taxes: {},
    demographics: { retirement_age: 67, life_expectancy: 85 },
  },
};

const MOCK_RESPONSE = {
  pension_data: MOCK_ANALYSIS,
  message: "ok",
} as never;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("usePensionAnalysis", () => {
  it("returns the backend analysis untouched on successful fetch", async () => {
    vi.mocked(RentencheckService.getPensionCalculation).mockResolvedValueOnce(MOCK_RESPONSE);

    const { result } = renderHook(() => usePensionAnalysis(1, 42));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(RentencheckService.getPensionCalculation).toHaveBeenCalledWith(1, 42);
    expect(result.current.analysis?.gap.monthly_today).toBe(771.48);
    expect(result.current.analysis?.rows[0]?.purchasing_power).toBe(728.52);
    expect(result.current.error).toBeNull();
  });

  it("does not fetch when clientId is undefined", () => {
    renderHook(() => usePensionAnalysis(undefined, 42));
    expect(RentencheckService.getPensionCalculation).not.toHaveBeenCalled();
  });

  it("does not fetch when rentencheckId is undefined", () => {
    renderHook(() => usePensionAnalysis(1, undefined));
    expect(RentencheckService.getPensionCalculation).not.toHaveBeenCalled();
  });

  it("sets error and leaves analysis null on API failure — no client-side fallback", async () => {
    vi.mocked(RentencheckService.getPensionCalculation).mockRejectedValueOnce(
      new Error("Netzwerkfehler"),
    );

    const { result } = renderHook(() => usePensionAnalysis(1, 42));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.analysis).toBeNull();
    expect(result.current.error).toBe("Netzwerkfehler");
  });
});
