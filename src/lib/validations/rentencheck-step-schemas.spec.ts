import { describe, it, expect } from "vitest";
import {
  ExpectationsStepSchema,
  PersonalFinancialStepSchema,
  FEDERAL_STATES,
} from "./rentencheck-step-schemas";
import {
  PayoutContractsArraySchema,
  PensionContractsArraySchema,
  AdditionalIncomeArraySchema,
  MAX_CONTRACT_ENTRIES,
} from "./contract-schemas";

const VALID_STEP1 = {
  profession: "IT",
  currentGrossIncome: 60000,
  currentNetIncome: 40000,
  maritalStatus: "Ledig",
  assetSeparation: "Nein",
  healthInsurance: "Gesetzlich/PflichtV",
  healthInsuranceContribution: 500,
};

const VALID_STEP2 = {
  currentAge: 35,
  retirementAge: 67,
  pensionWishCurrentValue: 2000,
  guaranteedAmount: 1000,
  provisionDuration: 92,
  assumedInflation: 2,
};

describe("PersonalFinancialStepSchema", () => {
  it("accepts a fully valid step 1 payload", () => {
    expect(PersonalFinancialStepSchema.safeParse(VALID_STEP1).success).toBe(true);
  });

  it("rejects negative currentGrossIncome", () => {
    const result = PersonalFinancialStepSchema.safeParse({
      ...VALID_STEP1,
      currentGrossIncome: -1,
    });
    expect(result.success).toBe(false);
  });

  it("accepts a valid federalState", () => {
    const result = PersonalFinancialStepSchema.safeParse({
      ...VALID_STEP1,
      federalState: "Bayern",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown federalState", () => {
    const result = PersonalFinancialStepSchema.safeParse({
      ...VALID_STEP1,
      federalState: "Atlantis",
    });
    expect(result.success).toBe(false);
  });

  it("treats federalState as optional", () => {
    expect(PersonalFinancialStepSchema.safeParse(VALID_STEP1).success).toBe(true);
  });

  it("exposes all 16 Bundesländer", () => {
    expect(FEDERAL_STATES).toHaveLength(16);
  });
});

describe("ExpectationsStepSchema", () => {
  it("accepts a fully valid step 2 payload", () => {
    expect(ExpectationsStepSchema.safeParse(VALID_STEP2).success).toBe(true);
  });

  it("rejects retirementAge equal to currentAge", () => {
    const result = ExpectationsStepSchema.safeParse({
      ...VALID_STEP2,
      currentAge: 67,
      retirementAge: 67,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0]?.message).toBe(
        "Renteneintrittsalter muss über dem aktuellen Alter liegen",
      );
    }
  });

  it("rejects retirementAge below currentAge", () => {
    const result = ExpectationsStepSchema.safeParse({
      ...VALID_STEP2,
      currentAge: 50,
      retirementAge: 40,
    });
    expect(result.success).toBe(false);
  });

  it("rejects pensionWishCurrentValue of 0", () => {
    const result = ExpectationsStepSchema.safeParse({
      ...VALID_STEP2,
      pensionWishCurrentValue: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects assumedInflation above 10", () => {
    const result = ExpectationsStepSchema.safeParse({
      ...VALID_STEP2,
      assumedInflation: 11,
    });
    expect(result.success).toBe(false);
  });

  it("rejects currentAge below 18", () => {
    const result = ExpectationsStepSchema.safeParse({
      ...VALID_STEP2,
      currentAge: 17,
      retirementAge: 67,
    });
    expect(result.success).toBe(false);
  });
});

describe("contract array max-5 enforcement", () => {
  const payout = {
    contract: "V-1",
    company: "Allianz",
    contractType: "Kapital-Lebensvers.",
    interestRate: 2,
    maturityYear: 2030,
    guaranteedAmount: 100,
    projectedAmount: 100,
  };
  const pension = {
    contract: "P-1",
    company: "AXA",
    contractType: "Basis-Rente",
    interestRate: 1,
    pensionStartYear: 2040,
    guaranteedAmount: 100,
    projectedAmount: 100,
    monthlyAmount: 100,
  };
  const income = { type: "Miete", startYear: 2025, amount: 100, frequency: "Monatlich" };

  it("accepts exactly 5 payout contracts", () => {
    expect(PayoutContractsArraySchema.safeParse(Array(5).fill(payout)).success).toBe(true);
  });

  it("rejects 6 payout contracts", () => {
    expect(PayoutContractsArraySchema.safeParse(Array(6).fill(payout)).success).toBe(false);
  });

  it("rejects 6 pension contracts", () => {
    expect(PensionContractsArraySchema.safeParse(Array(6).fill(pension)).success).toBe(false);
  });

  it("rejects 6 additional income entries", () => {
    expect(AdditionalIncomeArraySchema.safeParse(Array(6).fill(income)).success).toBe(false);
  });

  it("exposes the shared max constant as 5", () => {
    expect(MAX_CONTRACT_ENTRIES).toBe(5);
  });
});
