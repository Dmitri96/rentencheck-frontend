import { ApiService } from "../api-service";

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
  // Extended Step 3 fields used in analysis
  statutoryPensionAge?: number;
  statutoryPensionAmount?: number;
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
  payoutContracts: Array<{
    type: string;
    amount: number;
    description: string;
  }>;
  pensionContracts: Array<{
    type: string;
    amount: number;
    description: string;
  }>;
  additionalIncome: Array<{
    type: string;
    amount: number;
    description: string;
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

export class RentencheckService {
  private static baseUrl = "/clients";
  private static pendingDraftCreations = new Map<number, Promise<RentencheckResponse>>();

  /**
   * Get all rentenchecks for a specific client
   */
  static async getRentenchecks(clientId: number): Promise<RentencheckListResponse> {
    const response = await ApiService.get(`${this.baseUrl}/${clientId}/rentenchecks`);
    return response.data;
  }

  /**
   * Get a specific rentencheck
   */
  static async getRentencheck(
    clientId: number,
    rentencheckId: number,
  ): Promise<RentencheckResponse> {
    const response = await ApiService.get(
      `${this.baseUrl}/${clientId}/rentenchecks/${rentencheckId}`,
    );
    return response.data;
  }

  /**
   * Create a new rentencheck for a client
   */
  static async createRentencheck(
    clientId: number,
    data: { title?: string; notes?: string } = {},
  ): Promise<RentencheckResponse> {
    const response = await ApiService.post(`${this.baseUrl}/${clientId}/rentenchecks`, data);
    return response.data;
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
    const url = `${this.baseUrl}/${clientId}/rentenchecks/${rentencheckId}/step/${step}`;
    const response = await ApiService.put(url, stepData);
    return response.data;
  }

  /**
   * Complete a rentencheck
   */
  static async completeRentencheck(
    clientId: number,
    rentencheckId: number,
  ): Promise<RentencheckResponse> {
    const response = await ApiService.put(
      `${this.baseUrl}/${clientId}/rentenchecks/${rentencheckId}/complete`,
    );
    return response.data;
  }

  /**
   * Delete a rentencheck
   */
  static async deleteRentencheck(
    clientId: number,
    rentencheckId: number,
  ): Promise<{ message: string }> {
    const response = await ApiService.delete(
      `${this.baseUrl}/${clientId}/rentenchecks/${rentencheckId}`,
    );
    return response.data;
  }

  /**
   * Manually mark a step as completed
   */
  static async markStepCompleted(
    clientId: number,
    rentencheckId: number,
    step: number,
  ): Promise<RentencheckResponse> {
    const response = await ApiService.put(
      `${this.baseUrl}/${clientId}/rentenchecks/${rentencheckId}/step/${step}/complete`,
    );
    return response.data;
  }

  /**
   * Download PDF for a rentencheck
   */
  static async downloadPdf(clientId: number, rentencheckId: number): Promise<void> {
    try {
      const response = await ApiService.get(
        `${this.baseUrl}/${clientId}/rentenchecks/${rentencheckId}/pdf`,
        {
          responseType: "blob",
          headers: {
            Accept: "application/pdf",
          },
        },
      );

      // Create download link
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const filename = `Rentencheck_${rentencheckId}.pdf`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      throw new Error("Fehler beim Herunterladen des PDFs");
    }
  }

  /**
   * Get calculated pension data using dynamic backend parameters.
   *
   * Shape comes from backend `PensionCalculator::analyze()`. The full
   * OpenAPI-generated type lands in Wave 3C once backend Resource classes
   * gain `#[OA\Property]` annotations; until then the shape lives here
   * mirrored from the calculator's contract.
   */
  static async getPensionCalculation(
    clientId: number,
    rentencheckId: number,
  ): Promise<PensionCalculationResponse> {
    const response = await ApiService.get(
      `${this.baseUrl}/${clientId}/rentenchecks/${rentencheckId}/calculation`,
    );
    return response.data;
  }

  /**
   * Get or create a draft rentencheck for a client
   * This is useful for the "START" button to either continue existing draft or create new
   */
  static async getOrCreateDraftRentencheck(clientId: number): Promise<RentencheckResponse> {
    // Check if there's already a pending creation for this client
    const existingPromise = this.pendingDraftCreations.get(clientId);
    if (existingPromise) {
      console.log(
        "🔄 getOrCreateDraftRentencheck: Returning existing pending promise for clientId:",
        clientId,
      );
      return existingPromise;
    }

    // Create new promise and store it
    const promise = this._getOrCreateDraftRentencheckInternal(clientId);
    this.pendingDraftCreations.set(clientId, promise);

    try {
      const result = await promise;
      return result;
    } finally {
      // Clean up the pending promise
      this.pendingDraftCreations.delete(clientId);
    }
  }

  private static async _getOrCreateDraftRentencheckInternal(
    clientId: number,
  ): Promise<RentencheckResponse> {
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
   * Auto-save step data (fire and forget)
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
      // Don't throw error for auto-save failures
    }
  }
}
