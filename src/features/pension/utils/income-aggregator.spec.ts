import { describe, it, expect } from "vitest";
import { aggregateIncomeSources } from "./income-aggregator";
import type { RawStep3Data } from "./income-aggregator";

describe("aggregateIncomeSources", () => {
  it("returns empty array for null input", () => {
    expect(aggregateIncomeSources(null)).toEqual([]);
  });

  it("returns empty array for undefined input", () => {
    expect(aggregateIncomeSources(undefined)).toEqual([]);
  });

  it("returns empty array when step3 has no income data", () => {
    expect(aggregateIncomeSources({})).toEqual([]);
  });

  describe("statutory pension", () => {
    it("includes statutory provision when statutoryPensionClaims is true and amount > 0", () => {
      const step3: RawStep3Data = {
        statutoryPensionClaims: true,
        statutoryPensionAmount: 1200,
        civilServiceProvisionAmount: 0,
      };
      const result = aggregateIncomeSources(step3);
      expect(result).toHaveLength(1);
      expect(result[0]!.label).toBe("Gesetzl. Versorgung (inkl. Rentensteigerung)");
      expect(result[0]!.monthlyGross).toBe(1200);
    });

    it("combines statutory + civil service amounts into one entry", () => {
      const step3: RawStep3Data = {
        statutoryPensionClaims: true,
        statutoryPensionAmount: 1000,
        civilServiceProvisionAmount: 500,
      };
      const result = aggregateIncomeSources(step3);
      expect(result[0]!.monthlyGross).toBe(1500);
    });

    it("omits statutory entry when statutoryPensionClaims is false", () => {
      const step3: RawStep3Data = {
        statutoryPensionClaims: false,
        statutoryPensionAmount: 1200,
      };
      const result = aggregateIncomeSources(step3);
      expect(result).toHaveLength(0);
    });

    it("omits statutory entry when combined total is 0", () => {
      const step3: RawStep3Data = {
        statutoryPensionClaims: true,
        statutoryPensionAmount: 0,
        civilServiceProvisionAmount: 0,
      };
      expect(aggregateIncomeSources(step3)).toHaveLength(0);
    });
  });

  describe("BAV (professional + public service provision)", () => {
    it("groups professional and public service provisions into BAV entry", () => {
      const step3: RawStep3Data = {
        professionalProvisionAmount: 300,
        publicServiceProvisionAmount: 200,
      };
      const result = aggregateIncomeSources(step3);
      expect(result).toHaveLength(1);
      expect(result[0]!.label).toBe("BAV (neu)");
      expect(result[0]!.monthlyGross).toBe(500);
    });

    it("omits BAV entry when both amounts are 0", () => {
      const step3: RawStep3Data = {
        professionalProvisionAmount: 0,
        publicServiceProvisionAmount: 0,
      };
      expect(aggregateIncomeSources(step3)).toHaveLength(0);
    });
  });

  describe("pension contracts", () => {
    it("groups pension contracts by contractType and sums monthlyAmount", () => {
      const step3: RawStep3Data = {
        pensionContracts: [
          { contractType: "Riester-Rente", monthlyAmount: 100 },
          { contractType: "Riester-Rente", monthlyAmount: 150 },
          { contractType: "BAV-Rente", monthlyAmount: 250 },
        ],
      };
      const result = aggregateIncomeSources(step3);
      const riester = result.find((s) => s.label === "Riester-Rente");
      const bav = result.find((s) => s.label === "BAV-Rente");
      expect(riester?.monthlyGross).toBe(250);
      expect(bav?.monthlyGross).toBe(250);
    });

    it("uses 'Sonstige Rente' as fallback label when contractType is missing", () => {
      const step3: RawStep3Data = {
        pensionContracts: [{ monthlyAmount: 80 }],
      };
      const result = aggregateIncomeSources(step3);
      expect(result[0]!.label).toBe("Sonstige Rente");
    });

    it("omits pension contracts with 0 monthly amount", () => {
      const step3: RawStep3Data = {
        pensionContracts: [{ contractType: "Basis-Rente", monthlyAmount: 0 }],
      };
      expect(aggregateIncomeSources(step3)).toHaveLength(0);
    });
  });

  describe("payout contracts", () => {
    it("converts guaranteed lump sum to monthly equivalent (÷240)", () => {
      const step3: RawStep3Data = {
        payoutContracts: [{ contractType: "Investment", guaranteedAmount: 240000 }],
      };
      const result = aggregateIncomeSources(step3);
      expect(result).toHaveLength(1);
      expect(result[0]!.label).toBe("Auszahlungsverträge (äquiv. mtl.)");
      expect(result[0]!.monthlyGross).toBeCloseTo(1000);
    });

    it("sums multiple payout contracts before dividing", () => {
      const step3: RawStep3Data = {
        payoutContracts: [{ guaranteedAmount: 120000 }, { guaranteedAmount: 120000 }],
      };
      const result = aggregateIncomeSources(step3);
      expect(result[0]!.monthlyGross).toBeCloseTo(1000);
    });
  });

  describe("additional income", () => {
    it("keeps monthly frequency as-is", () => {
      const step3: RawStep3Data = {
        additionalIncome: [{ type: "Mieteinnahme", amount: 500, frequency: "Monatlich" }],
      };
      const result = aggregateIncomeSources(step3);
      expect(result[0]!.monthlyGross).toBe(500);
    });

    it("divides annual income by 12", () => {
      const step3: RawStep3Data = {
        additionalIncome: [{ type: "Dividenden", amount: 12000, frequency: "Jährlich" }],
      };
      const result = aggregateIncomeSources(step3);
      expect(result[0]!.monthlyGross).toBeCloseTo(1000);
    });

    it("divides one-off income by 240", () => {
      const step3: RawStep3Data = {
        additionalIncome: [{ type: "Erbschaft", amount: 240000, frequency: "Einmalig" }],
      };
      const result = aggregateIncomeSources(step3);
      expect(result[0]!.monthlyGross).toBeCloseTo(1000);
    });

    it("groups additional income by type and sums", () => {
      const step3: RawStep3Data = {
        additionalIncome: [
          { type: "Mieteinnahme", amount: 400, frequency: "Monatlich" },
          { type: "Mieteinnahme", amount: 200, frequency: "Monatlich" },
        ],
      };
      const result = aggregateIncomeSources(step3);
      expect(result).toHaveLength(1);
      expect(result[0]!.monthlyGross).toBe(600);
    });

    it("uses 'Zusatzeinkommen' as fallback label when type is missing", () => {
      const step3: RawStep3Data = {
        additionalIncome: [{ amount: 300, frequency: "Monatlich" }],
      };
      const result = aggregateIncomeSources(step3);
      expect(result[0]!.label).toBe("Zusatzeinkommen");
    });
  });

  describe("mixed contract shapes", () => {
    it("aggregates all income source categories together", () => {
      const step3: RawStep3Data = {
        statutoryPensionClaims: true,
        statutoryPensionAmount: 1000,
        professionalProvisionAmount: 200,
        pensionContracts: [{ contractType: "Riester-Rente", monthlyAmount: 100 }],
        payoutContracts: [{ guaranteedAmount: 24000 }],
        additionalIncome: [{ type: "Mieteinnahme", amount: 500, frequency: "Monatlich" }],
      };
      const result = aggregateIncomeSources(step3);
      expect(result.length).toBeGreaterThanOrEqual(4);
      const labels = result.map((s) => s.label);
      expect(labels).toContain("Gesetzl. Versorgung (inkl. Rentensteigerung)");
      expect(labels).toContain("BAV (neu)");
      expect(labels).toContain("Riester-Rente");
      expect(labels).toContain("Mieteinnahme");
    });

    it("handles string amounts via Number() coercion", () => {
      const step3: RawStep3Data = {
        pensionContracts: [
          { contractType: "Basis-Rente", monthlyAmount: "250" as unknown as number },
        ],
      };
      const result = aggregateIncomeSources(step3);
      expect(result[0]!.monthlyGross).toBe(250);
    });
  });
});
