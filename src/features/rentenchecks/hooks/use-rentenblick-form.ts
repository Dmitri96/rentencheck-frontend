import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ZodError } from "zod";
import { api } from "@/lib/api";
import type { RentencheckData } from "@/lib/services/rentencheck-service";
import {
  ExpectationsStepSchema,
  PersonalFinancialStepSchema,
} from "@/lib/validations/rentencheck-step-schemas";

const DEFAULT_FORM_DATA: RentencheckData = {
  profession: "",
  currentGrossIncome: 0,
  hasToChurchTax: false,
  currentNetIncome: 0,
  maritalStatus: "Ledig",
  assetSeparation: "Nein",
  healthInsurance: "Gesetzlich/PflichtV",
  healthInsuranceContribution: 0,
  federalState: undefined,
  hasChildren: true,
  currentAge: 30,
  retirementAge: 67,
  pensionWishCurrentValue: 0,
  guaranteedAmount: 0,
  provisionDuration: 92,
  assumedInflation: 0,
  statutoryPensionClaims: false,
  statutoryPensionAge: 0,
  statutoryPensionAmount: 0,
  disabilityPensionAmount: 0,
  privateDisabilityInsuranceAmount: 0,
  professionalProvisionWorks: false,
  professionalProvisionAge: 0,
  professionalProvisionAmount: 0,
  publicServiceAdditionalProvision: false,
  publicServiceProvisionAge: 0,
  publicServiceProvisionAmount: 0,
  civilServiceProvision: false,
  civilServiceProvisionAge: 0,
  civilServiceProvisionAmount: 0,
  payoutContracts: [],
  pensionContracts: [],
  additionalIncome: [],
  aspectRatings: {
    availabilityDuringSavings: "",
    flexibilityInRetirement: "",
    capitalOrAnnuityChoice: "",
    childBenefits: "",
    initialPaymentOption: "",
    taxSavingsInSavingsPhase: "",
    lowTaxInPayoutPhase: "",
    protectionAgainstDisability: "",
    survivorBenefits: "",
    deathBenefitsOutsideFamily: "",
    protectionAgainstThirdParties: "",
  },
  productDependsOnEmployer: "",
  taxLimitationsInSavingsPhase: "",
  onlyForRetirement: "",
  finalNotes: "",
  date: "25.05.2025",
  location: "",
};

const NUM_STEPS = 5;

type UseRentenblickFormArgs = {
  initialData?: Partial<RentencheckData>;
  completedSteps?: number[];
  onStepSave?: (stepId: number, data: RentencheckData) => Promise<void>;
  onComplete?: () => Promise<void>;
};

/**
 * State + side-effects for the 5-step rentencheck wizard.
 *
 * Extracted from the 630 LOC <RentenblickForm>. Owns:
 *   - formData and updateFormData (with stable identity via useCallback)
 *   - currentStep, confirmedSteps + step navigation
 *   - results-view toggle (showResults / backToForm / generatePDF)
 *   - one-shot defaults load from /pension-parameters on mount
 *
 * Returns a flat surface so the wizard shell stays a pure renderer.
 */
export function useRentenblickForm({
  initialData = {},
  completedSteps = [],
  onStepSave,
  onComplete,
}: UseRentenblickFormArgs) {
  const [currentStep, setCurrentStep] = useState(1);
  const [confirmedSteps, setConfirmedSteps] = useState<number[]>(completedSteps);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [formData, setFormData] = useState<RentencheckData>({
    ...DEFAULT_FORM_DATA,
    ...initialData,
  });

  // Keep confirmedSteps in sync with the parent's completedSteps prop.
  useEffect(() => {
    setConfirmedSteps(completedSteps);
  }, [completedSteps]);

  // Load admin-configured defaults exactly once on mount. Failure is non-fatal.
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data: rawData, error } = await api.GET("/pension-parameters");
        if (error) throw new Error("API Fehler");

        const p = rawData.data.parameters;

        const mappedDefaults: Partial<RentencheckData> = {
          assumedInflation: p.economic_assumptions?.inflation_rate ?? undefined,
          retirementAge: p.demographics?.retirement_age ?? undefined,
          provisionDuration: p.demographics?.life_expectancy ?? undefined,
          healthInsuranceContribution: p.social_insurance?.total_insurance_rate ?? undefined,
          statutoryPensionAge: p.demographics?.retirement_age,
          professionalProvisionAge: p.demographics?.retirement_age,
          publicServiceProvisionAge: p.demographics?.retirement_age,
          civilServiceProvisionAge: p.demographics?.retirement_age,
        };

        setFormData((prev) => ({
          ...prev,
          ...Object.fromEntries(Object.entries(mappedDefaults).filter(([, v]) => v !== undefined)),
        }));
      } catch (err) {
        console.error(err);
        toast.error("Fehler beim Laden der Einstellungen");
      } finally {
        setLoading(false);
      }
    };
    load();
    // Defaults load is mount-only; deliberately no dependency list change.
  }, []);

  const updateFormData = useCallback((data: Partial<RentencheckData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  /**
   * Validates the calculation-critical steps (1 + 2) before they are confirmed.
   * Mirrors the Zod-parse + toast pattern used by useContractManagement.
   */
  const validateStep = useCallback(
    (stepId: number): boolean => {
      const schema =
        stepId === 1 ? PersonalFinancialStepSchema : stepId === 2 ? ExpectationsStepSchema : null;
      if (!schema) return true;

      const result = schema.safeParse(formData);
      if (result.success) return true;

      const zodError = result.error instanceof ZodError ? result.error : new ZodError([]);
      const firstMessage = zodError.errors[0]?.message ?? "Bitte korrigieren Sie die Eingabefehler";
      toast.error(firstMessage);
      return false;
    },
    [formData],
  );

  const confirmStep = useCallback(
    async (stepId: number) => {
      if (confirmedSteps.includes(stepId)) return;
      if (!validateStep(stepId)) return;

      setConfirmedSteps((prev) => (prev.includes(stepId) ? prev : [...prev, stepId]));
      if (onStepSave) {
        await onStepSave(stepId, formData);
      }
    },
    [confirmedSteps, formData, onStepSave, validateStep],
  );

  const editStep = useCallback((stepId: number) => {
    setConfirmedSteps((prev) => prev.filter((id) => id !== stepId));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((s) => (s < NUM_STEPS ? s + 1 : s));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((s) => (s > 1 ? s - 1 : s));
  }, []);

  const generatePDF = useCallback(async () => {
    try {
      await confirmStep(currentStep);
      setShowResults(true);
      if (onComplete) {
        await onComplete();
      }
    } catch (error) {
      console.error("Error completing form:", error);
    }
  }, [confirmStep, currentStep, onComplete]);

  const backToForm = useCallback(() => {
    setShowResults(false);
  }, []);

  return {
    // state
    currentStep,
    confirmedSteps,
    loading,
    showResults,
    formData,
    progress: (currentStep / NUM_STEPS) * 100,
    numSteps: NUM_STEPS,
    isCurrentStepConfirmed: confirmedSteps.includes(currentStep),
    // mutators
    updateFormData,
    confirmStep,
    editStep,
    nextStep,
    prevStep,
    generatePDF,
    backToForm,
    setShowResults,
  };
}
