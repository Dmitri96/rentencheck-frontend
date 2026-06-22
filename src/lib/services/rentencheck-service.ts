import { api } from "@/lib/api";

/**
 * Response shape for GET /clients/{clientId}/rentenchecks/{rentencheckId}/calculation.
 * Mirrors backend `PensionCalculator::analyze()`. Full OpenAPI generation lands in Wave 3C.
 */
export interface PensionCalculationData {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  inflationRate: number;
  statutoryPensionGross: number;
  statutoryPensionAfterInsurance: number;
  privatePensionToday: number;
  bavRiesterToday: number;
  parameters_used: {
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
    tax_system: {
      rates: Record<string, number | undefined>;
      thresholds: Record<string, number | undefined>;
      solidarity_surcharge_rate?: number;
      solidarity_surcharge_threshold?: number;
    };
  };
}

export interface PensionCalculationResponse {
  pension_data: PensionCalculationData;
  pension_totals: Record<string, unknown>;
  client: Record<string, unknown>;
  message: string;
}

export interface RentencheckData {
  // Step 1: Personal and Financial Information
  profession: string;
  currentGrossIncome: number;
  currentNetIncome: number;
  maritalStatus: string;
  assetSeparation: string;
  healthInsurance: string;
  healthInsuranceContribution: number;
  // Optional: whether church tax applies (frontend control). If omitted, assume true.
  hasToChurchTax?: boolean;

  // Step 2: Expectations
  currentAge: number;
  retirementAge: number;
  pensionWishCurrentValue: number;
  guaranteedAmount: number;
  provisionDuration: number;
  assumedInflation: number;

  // Step 3: Contract Overview
  statutoryPensionClaims: boolean;
  statutoryPensionAge?: number;
  statutoryPensionAmount?: number;
  // Monthly disability pension (Erwerbsminderungsrente).
  disabilityPensionAmount?: number;

  professionalProvisionWorks: boolean;
  professionalProvisionAge?: number;
  professionalProvisionAmount?: number;

  publicServiceAdditionalProvision: boolean;
  publicServiceProvisionAge?: number;
  publicServiceProvisionAmount?: number;

  civilServiceProvision: boolean;
  civilServiceProvisionAge?: number;
  civilServiceProvisionAmount?: number;

  // Contract shapes mirror the backend FormRequest enums in UpdateRentencheckStepRequest.
  payoutContracts: Array<{
    contract: string;
    company: string;
    contractType: string;
    interestRate: number;
    maturityYear: number;
    guaranteedAmount: number;
    projectedAmount: number;
  }>;
  pensionContracts: Array<{
    contract: string;
    company: string;
    contractType: string;
    interestRate: number;
    pensionStartYear: number;
    guaranteedAmount: number;
    projectedAmount: number;
    monthlyAmount: number;
  }>;
  additionalIncome: Array<{
    type: string;
    startYear: number;
    amount: number;
    frequency: string;
  }>;

  // Step 4: Important Aspects
  aspectRatings: {
    availabilityDuringSavings: string;
    flexibilityInRetirement: string;
    capitalOrAnnuityChoice: string;
    childBenefits: string;
    initialPaymentOption: string;
    taxSavingsInSavingsPhase: string;
    lowTaxInPayoutPhase: string;
    protectionAgainstDisability: string;
    survivorBenefits: string;
    deathBenefitsOutsideFamily: string;
    protectionAgainstThirdParties: string;
  };
  productDependsOnEmployer: string;
  taxLimitationsInSavingsPhase: string;
  onlyForRetirement: string;

  // Step 5: Conclusion
  finalNotes: string;
  date: string;
  location: string;
}

export interface RentencheckContract {
  id: number;
  rentencheck_id: number;
  category: "payout" | "pension" | "additional_income";
  contract_type: string;
  amount: number;
  description?: string;
  sort_order: number;
}

export interface FileInfo {
  id: number;
  name: string;
  filename: string;
  mime_type: string;
  extension: string;
  size: number;
  type: string;
  description?: string;
  uploaded_at: string;
  human_size: string;
}

export interface Rentencheck {
  id: number;
  user_id: number;
  client_id: number;
  status: "draft" | "completed" | "archived";
  title: string;
  notes?: string;
  completed_steps: number[];
  step_1_data?: Partial<RentencheckData>;
  step_2_data?: Partial<RentencheckData>;
  step_3_data?: Partial<RentencheckData>;
  step_4_data?: Partial<RentencheckData>;
  step_5_data?: Partial<RentencheckData>;
  progress_percentage: number;
  is_complete: boolean;
  created_at: string;
  updated_at: string;
  files?: FileInfo[];
  client?: {
    id: number;
    full_name: string;
    email: string;
  };
}

export interface RentencheckResponse {
  rentencheck: Rentencheck;
  contracts?: {
    payout: RentencheckContract[];
    pension: RentencheckContract[];
    additional_income: RentencheckContract[];
  };
  client: {
    id: number;
    full_name: string;
    email: string;
  };
  message: string;
}

export interface RentencheckListResponse {
  data: Rentencheck[];
  client: {
    id: number;
    full_name: string;
    email: string;
  };
}

// Scramble infers rentencheck endpoints loosely (Eloquent model.toArray() has no typed schema).
// These helpers unwrap the real runtime shape.
function unwrapRentencheckResponse(raw: unknown): RentencheckResponse {
  const payload = raw as {
    data?: {
      rentencheck?: unknown;
      contracts?: unknown;
      client?: unknown;
    };
    rentencheck?: unknown;
    contracts?: unknown;
    client?: unknown;
    message?: string;
  };

  // Some endpoints wrap in `data`, others return fields directly.
  const inner = payload.data ?? payload;

  return {
    rentencheck: (inner.rentencheck ?? inner) as Rentencheck,
    contracts: inner.contracts as RentencheckResponse["contracts"],
    client: (inner.client ?? {}) as RentencheckResponse["client"],
    message: payload.message ?? "",
  };
}

function unwrapRentencheckListResponse(raw: unknown): RentencheckListResponse {
  const payload = raw as {
    data?: { data?: unknown[]; client?: unknown };
    message?: string;
  };

  const inner = payload.data ?? { data: [], client: {} };

  return {
    data: ((inner.data as unknown[]) ?? []) as Rentencheck[],
    client: (inner.client ?? {}) as RentencheckListResponse["client"],
  };
}

export class RentencheckService {
  private static pendingDraftCreations = new Map<number, Promise<RentencheckResponse>>();

  /**
   * Get all rentenchecks for a specific client
   */
  static async getRentenchecks(clientId: number): Promise<RentencheckListResponse> {
    const { data, error } = await api.GET("/clients/{clientId}/rentenchecks", {
      params: { path: { clientId } },
    });

    if (error) throw error;

    return unwrapRentencheckListResponse(data);
  }

  /**
   * Get a specific rentencheck
   */
  static async getRentencheck(
    clientId: number,
    rentencheckId: number,
  ): Promise<RentencheckResponse> {
    const { data, error } = await api.GET("/clients/{clientId}/rentenchecks/{rentencheckId}", {
      params: { path: { clientId, rentencheckId } },
    });

    if (error) throw error;

    return unwrapRentencheckResponse(data);
  }

  /**
   * Create a new rentencheck for a client
   */
  static async createRentencheck(
    clientId: number,
    rentencheckData: { title?: string; notes?: string } = {},
  ): Promise<RentencheckResponse> {
    const { data, error } = await api.POST("/clients/{clientId}/rentenchecks", {
      params: { path: { clientId } },
      body: {
        title: rentencheckData.title,
        notes: rentencheckData.notes,
      },
    });

    if (error) throw error;

    return unwrapRentencheckResponse(data);
  }

  /**
   * Update step data for a rentencheck
   */
  static async updateStep(
    clientId: number,
    rentencheckId: number,
    step: number,
    stepData: Partial<RentencheckData>,
  ): Promise<RentencheckResponse> {
    const { data, error } = await api.PUT(
      "/clients/{clientId}/rentenchecks/{rentencheckId}/step/{step}",
      {
        params: { path: { clientId, rentencheckId, step } },
        // Scramble cannot infer the UpdateRentencheckStepRequest body shape; cast is required.
        body: stepData as never,
      },
    );

    if (error) throw error;

    return unwrapRentencheckResponse(data);
  }

  /**
   * Complete a rentencheck
   */
  static async completeRentencheck(
    clientId: number,
    rentencheckId: number,
  ): Promise<RentencheckResponse> {
    const { data, error } = await api.PUT(
      "/clients/{clientId}/rentenchecks/{rentencheckId}/complete",
      {
        params: { path: { clientId, rentencheckId } },
      },
    );

    if (error) throw error;

    return unwrapRentencheckResponse(data);
  }

  /**
   * Delete a rentencheck
   */
  static async deleteRentencheck(
    clientId: number,
    rentencheckId: number,
  ): Promise<{ message: string }> {
    const { data, error } = await api.DELETE("/clients/{clientId}/rentenchecks/{rentencheckId}", {
      params: { path: { clientId, rentencheckId } },
    });

    if (error) throw error;

    return { message: data.message };
  }

  /**
   * Manually mark a step as completed
   */
  static async markStepCompleted(
    clientId: number,
    rentencheckId: number,
    step: number,
  ): Promise<RentencheckResponse> {
    const { data, error } = await api.PUT(
      "/clients/{clientId}/rentenchecks/{rentencheckId}/step/{step}/complete",
      {
        params: { path: { clientId, rentencheckId, step } },
      },
    );

    if (error) throw error;

    return unwrapRentencheckResponse(data);
  }

  /**
   * Download PDF for a rentencheck. Uses native fetch since the response is
   * a binary blob, not JSON — openapi-fetch only parses JSON responses.
   */
  static async downloadPdf(clientId: number, rentencheckId: number): Promise<void> {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL ??
      (typeof window !== "undefined"
        ? `${window.location.origin}/api`
        : "http://localhost:8000/api");

    const xsrfMatch =
      typeof document !== "undefined"
        ? document.cookie.split("; ").find((row) => row.startsWith("XSRF-TOKEN="))
        : undefined;
    const xsrfToken = xsrfMatch ? decodeURIComponent(xsrfMatch.split("=")[1] ?? "") : "";

    const response = await fetch(
      `${baseUrl}/clients/${clientId}/rentenchecks/${rentencheckId}/pdf`,
      {
        credentials: "include",
        headers: {
          Accept: "application/pdf",
          ...(xsrfToken ? { "X-XSRF-TOKEN": xsrfToken } : {}),
        },
      },
    );

    if (!response.ok) {
      throw new Error("Fehler beim Herunterladen des PDFs");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Rentencheck_${rentencheckId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Get calculated pension data using dynamic backend parameters.
   *
   * Shape comes from backend `PensionCalculator::analyze()`. The full
   * OpenAPI-generated type lands in Wave 3C once backend Resource classes
   * gain `#[OA\Property]` annotations.
   */
  static async getPensionCalculation(
    clientId: number,
    rentencheckId: number,
  ): Promise<PensionCalculationResponse> {
    const { data, error } = await api.GET(
      "/clients/{clientId}/rentenchecks/{rentencheckId}/calculation",
      {
        params: { path: { clientId, rentencheckId } },
      },
    );

    if (error) throw error;

    // Schema types pension_data fields via inference from PensionCalculator.analyze(); cast for client/totals.
    const payload = data as unknown as {
      data: {
        pension_data: PensionCalculationData;
        pension_totals: Record<string, unknown>;
        client: Record<string, unknown>;
      };
      message: string;
    };

    return {
      pension_data: payload.data.pension_data,
      pension_totals: payload.data.pension_totals,
      client: payload.data.client,
      message: payload.message,
    };
  }

  /**
   * Get or create a draft rentencheck for a client.
   * Deduplicates concurrent calls so only one creation request fires per client.
   */
  static async getOrCreateDraftRentencheck(clientId: number): Promise<RentencheckResponse> {
    const existing = this.pendingDraftCreations.get(clientId);
    if (existing) return existing;

    const promise = this._getOrCreateDraftInternal(clientId);
    this.pendingDraftCreations.set(clientId, promise);

    try {
      return await promise;
    } finally {
      this.pendingDraftCreations.delete(clientId);
    }
  }

  private static async _getOrCreateDraftInternal(clientId: number): Promise<RentencheckResponse> {
    try {
      const listResponse = await this.getRentenchecks(clientId);
      const existingDraft = listResponse.data.find((r) => r.status === "draft");

      if (existingDraft) {
        return await this.getRentencheck(clientId, existingDraft.id);
      }

      return await this.createRentencheck(clientId, {
        title: `Rentencheck für ${listResponse.client.full_name}`,
      });
    } catch {
      // No existing rentenchecks for this client → start a fresh draft.
      return await this.createRentencheck(clientId);
    }
  }

  /**
   * Auto-save step data (fire and forget — failure is non-fatal)
   */
  static async autoSaveStep(
    clientId: number,
    rentencheckId: number,
    step: number,
    stepData: Partial<RentencheckData>,
  ): Promise<void> {
    try {
      await this.updateStep(clientId, rentencheckId, step, stepData);
    } catch (error) {
      console.warn("Auto-save failed:", error);
    }
  }
}
