import { describe, it, expect } from "vitest";
import {
  PayoutContractSchema,
  PensionContractSchema,
  AdditionalIncomeSchema,
} from "./contract-schemas";

// Minimal valid fixtures
const VALID_PAYOUT = {
  contract: "V-12345",
  company: "Allianz",
  contractType: "Kapital-Lebensvers.",
  interestRate: 2.5,
  maturityYear: 2030,
  guaranteedAmount: 50000,
  projectedAmount: 60000,
};

const VALID_PENSION = {
  contract: "P-99001",
  company: "AXA",
  contractType: "Riester-Rente",
  interestRate: 1.5,
  pensionStartYear: 2040,
  guaranteedAmount: 200,
  projectedAmount: 350,
  monthlyAmount: 300,
};

const VALID_ADDITIONAL = {
  type: "Mieteinnahme",
  startYear: 2025,
  amount: 800,
  frequency: "Monatlich",
};

// ─── PayoutContractSchema ────────────────────────────────────────────────────

describe("PayoutContractSchema", () => {
  it("accepts a fully valid payout contract", () => {
    expect(PayoutContractSchema.safeParse(VALID_PAYOUT).success).toBe(true);
  });

  it("rejects empty contract number", () => {
    const result = PayoutContractSchema.safeParse({ ...VALID_PAYOUT, contract: "" });
    expect(result.success).toBe(false);
  });

  it("rejects empty company name", () => {
    const result = PayoutContractSchema.safeParse({ ...VALID_PAYOUT, company: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid contractType not in allowed list", () => {
    const result = PayoutContractSchema.safeParse({
      ...VALID_PAYOUT,
      contractType: "UnbekannterTyp",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.errors.map((e) => e.message);
      expect(messages).toContain("Ungültiger Vertragstyp");
    }
  });

  it("accepts all valid payout contractTypes", () => {
    const types = ["Kapital-Lebensvers.", "Rentenvers.", "Direktvers.", "Investment", "andere Art"];
    for (const contractType of types) {
      const result = PayoutContractSchema.safeParse({ ...VALID_PAYOUT, contractType });
      expect(result.success).toBe(true);
    }
  });

  it("rejects maturityYear below 1900", () => {
    const result = PayoutContractSchema.safeParse({ ...VALID_PAYOUT, maturityYear: 1899 });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.errors.map((e) => e.message);
      expect(messages.some((m) => m.includes("1900"))).toBe(true);
    }
  });

  it("accepts maturityYear of exactly 2024", () => {
    expect(PayoutContractSchema.safeParse({ ...VALID_PAYOUT, maturityYear: 2024 }).success).toBe(
      true,
    );
  });

  it("rejects guaranteedAmount <= 0", () => {
    const zero = PayoutContractSchema.safeParse({ ...VALID_PAYOUT, guaranteedAmount: 0 });
    expect(zero.success).toBe(false);
    const negative = PayoutContractSchema.safeParse({ ...VALID_PAYOUT, guaranteedAmount: -1 });
    expect(negative.success).toBe(false);
  });

  it("accepts guaranteedAmount > 0", () => {
    expect(
      PayoutContractSchema.safeParse({ ...VALID_PAYOUT, guaranteedAmount: 0.01 }).success,
    ).toBe(true);
  });
});

// ─── PensionContractSchema ───────────────────────────────────────────────────

describe("PensionContractSchema", () => {
  it("accepts a fully valid pension contract", () => {
    expect(PensionContractSchema.safeParse(VALID_PENSION).success).toBe(true);
  });

  it("rejects invalid contractType not in allowed list", () => {
    const result = PensionContractSchema.safeParse({ ...VALID_PENSION, contractType: "XYZ" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.map((e) => e.message)).toContain("Ungültiger Vertragstyp");
    }
  });

  it("accepts all valid pension contractTypes", () => {
    const types = ["Basis-Rente", "Riester-Rente", "BAV-Rente", "Mieteinnahme", "andere Art"];
    for (const contractType of types) {
      expect(PensionContractSchema.safeParse({ ...VALID_PENSION, contractType }).success).toBe(
        true,
      );
    }
  });

  it("rejects monthlyAmount <= 0", () => {
    expect(PensionContractSchema.safeParse({ ...VALID_PENSION, monthlyAmount: 0 }).success).toBe(
      false,
    );
    expect(PensionContractSchema.safeParse({ ...VALID_PENSION, monthlyAmount: -5 }).success).toBe(
      false,
    );
  });

  it("accepts monthlyAmount > 0", () => {
    expect(PensionContractSchema.safeParse({ ...VALID_PENSION, monthlyAmount: 0.01 }).success).toBe(
      true,
    );
  });

  it("rejects pensionStartYear below 1900", () => {
    const result = PensionContractSchema.safeParse({ ...VALID_PENSION, pensionStartYear: 1800 });
    expect(result.success).toBe(false);
  });
});

// ─── AdditionalIncomeSchema ──────────────────────────────────────────────────

describe("AdditionalIncomeSchema", () => {
  it("accepts a fully valid additional income entry", () => {
    expect(AdditionalIncomeSchema.safeParse(VALID_ADDITIONAL).success).toBe(true);
  });

  it("rejects invalid frequency not in allowed list", () => {
    const result = AdditionalIncomeSchema.safeParse({
      ...VALID_ADDITIONAL,
      frequency: "Wöchentlich",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.map((e) => e.message)).toContain("Ungültige Periodizität");
    }
  });

  it("accepts all valid frequency values", () => {
    for (const frequency of ["Einmalig", "Monatlich", "Jährlich"]) {
      expect(AdditionalIncomeSchema.safeParse({ ...VALID_ADDITIONAL, frequency }).success).toBe(
        true,
      );
    }
  });

  it("rejects amount <= 0", () => {
    expect(AdditionalIncomeSchema.safeParse({ ...VALID_ADDITIONAL, amount: 0 }).success).toBe(
      false,
    );
    expect(AdditionalIncomeSchema.safeParse({ ...VALID_ADDITIONAL, amount: -100 }).success).toBe(
      false,
    );
  });

  it("accepts amount > 0", () => {
    expect(AdditionalIncomeSchema.safeParse({ ...VALID_ADDITIONAL, amount: 0.01 }).success).toBe(
      true,
    );
  });

  it("rejects empty type", () => {
    expect(AdditionalIncomeSchema.safeParse({ ...VALID_ADDITIONAL, type: "" }).success).toBe(false);
  });

  it("rejects startYear below 1900", () => {
    const result = AdditionalIncomeSchema.safeParse({ ...VALID_ADDITIONAL, startYear: 1800 });
    expect(result.success).toBe(false);
  });
});
