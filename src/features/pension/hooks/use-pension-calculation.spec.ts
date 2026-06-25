import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { usePensionCalculation } from "./use-pension-calculation";
import { RentencheckService } from "@/lib/services/rentencheck-service";

vi.mock("@/lib/services/rentencheck-service", () => ({
  RentencheckService: {
    getPensionCalculation: vi.fn(),
  },
}));

const MOCK_BACKEND_DATA = {
  currentAge: 40,
  retirementAge: 67,
  lifeExpectancy: 85,
  inflationRate: 0.02,
  statutoryPensionGross: 1200,
  statutoryPensionAfterInsurance: 1100,
  privatePensionToday: 300,
  bavRiesterToday: 200,
  parameters_used: {
    economic_assumptions: {
      inflation_rate: 0.02,
      investment_return_rate: 0.04,
    },
    social_insurance: {
      health_insurance_rate: 0.073,
      care_insurance_rate: 0.0155,
      total_insurance_rate: 0.0885,
    },
    tax_system: {
      rates: {},
      thresholds: {},
    },
  },
};

const MOCK_RESPONSE = {
  pension_data: MOCK_BACKEND_DATA,
  pension_totals: {},
  client: {},
  message: "ok",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("usePensionCalculation", () => {
  it("returns pensionData on successful fetch when all args are set", async () => {
    vi.mocked(RentencheckService.getPensionCalculation).mockResolvedValueOnce(MOCK_RESPONSE);

    const { result } = renderHook(() => usePensionCalculation(1, 42, 2000));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(RentencheckService.getPensionCalculation).toHaveBeenCalledWith(1, 42);
    expect(result.current.pensionData).not.toBeNull();
    expect(result.current.pensionData?.currentAge).toBe(40);
    expect(result.current.pensionData?.isBackendCalculation).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("does not fetch when clientId is undefined", () => {
    renderHook(() => usePensionCalculation(undefined, 42, 2000));
    expect(RentencheckService.getPensionCalculation).not.toHaveBeenCalled();
  });

  it("does not fetch when rentencheckId is undefined", () => {
    renderHook(() => usePensionCalculation(1, undefined, 2000));
    expect(RentencheckService.getPensionCalculation).not.toHaveBeenCalled();
  });

  it("does not fetch when desiredPension is undefined", () => {
    renderHook(() => usePensionCalculation(1, 42, undefined));
    expect(RentencheckService.getPensionCalculation).not.toHaveBeenCalled();
  });

  it("sets error and clears pensionData on API failure", async () => {
    vi.mocked(RentencheckService.getPensionCalculation).mockRejectedValueOnce(
      new Error("Netzwerkfehler"),
    );

    const { result } = renderHook(() => usePensionCalculation(1, 42, 2000));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.pensionData).toBeNull();
    expect(result.current.error).toBe("Netzwerkfehler");
  });

  it("calculates currentPensionGap as Math.max(0, desired - sum of 3 components)", async () => {
    vi.mocked(RentencheckService.getPensionCalculation).mockResolvedValueOnce(MOCK_RESPONSE);

    // desiredPension = 2000, sum = 1100 + 300 + 200 = 1600 → gap = 400
    const { result } = renderHook(() => usePensionCalculation(1, 42, 2000));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.pensionData?.currentPensionGap).toBe(400);
  });

  it("clamps currentPensionGap at 0 when desired is less than available income", async () => {
    vi.mocked(RentencheckService.getPensionCalculation).mockResolvedValueOnce(MOCK_RESPONSE);

    // desiredPension = 500, sum = 1600 → gap should be 0, not negative
    const { result } = renderHook(() => usePensionCalculation(1, 42, 500));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.pensionData?.currentPensionGap).toBe(0);
  });

  it("maps parameters_used to the parameters field on PensionData", async () => {
    vi.mocked(RentencheckService.getPensionCalculation).mockResolvedValueOnce(MOCK_RESPONSE);

    const { result } = renderHook(() => usePensionCalculation(1, 42, 2000));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.pensionData?.parameters.economic_assumptions.inflation_rate).toBe(0.02);
    expect(result.current.pensionData?.parameters.social_insurance.total_insurance_rate).toBe(
      0.0885,
    );
  });
});
