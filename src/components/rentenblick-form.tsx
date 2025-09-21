"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Lock,
  Edit3,
  BarChart3,
  FileText,
} from "lucide-react";
import { PersonalFinancialStep } from "./form-steps/personal-financial-step";
import { ExpectationsStep } from "./form-steps/expectations-step";
import { ContractOverviewStep } from "./form-steps/contract-overview-step";
import { ImportantAspectsStep } from "./form-steps/important-aspects-step";
import { ConclusionStep } from "./form-steps/conclusion-step";
import { PensionResultsOverview } from "./pension-results-overview";
import { toast } from "sonner";
import ApiService from "@/lib/api-service";

// Narrow type for the admin "current_parameters" response used for mapping defaults
type PensionParameters = {
  economic_assumptions?: {
    inflation_rate?: number;
    pension_increase_rate?: number;
    investment_return_rate?: number;
  };
  social_insurance?: {
    health_insurance_rate?: number;
    additional_health_insurance_rate?: number;
    care_insurance_rate?: number;
    total_insurance_rate?: number;
    health_insurance_exemption_bav?: number;
  };
  tax_system?: unknown; // not needed for the form defaults
  regional_taxes?: unknown; // not needed for the form defaults
  demographics?: {
    retirement_age?: number;
    life_expectancy?: number;
  };
};

export interface RentenblickData {
  // Step 1: Personal and Financial Information
  profession: string;
  currentGrossIncome: number;
  currentNetIncome: number;
  maritalStatus: string;
  assetSeparation: string;
  healthInsurance: string;
  healthInsuranceContribution: number;
  hasToChurchTax: boolean;

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
  // New: disability pension amount (Erwerbsminderungsrente), monthly
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

const steps = [
  {
    id: 1,
    title: "Persönliche und finanzielle Angaben",
    description: "Grunddaten und Einkommen",
    icon: "👤",
  },
  {
    id: 2,
    title: "Ihre Erwartungen",
    description: "Rentenwünsche und Ziele",
    icon: "🎯",
  },
  {
    id: 3,
    title: "Vertragsübersicht",
    description: "Bestehende Verträge",
    icon: "📄",
  },
  {
    id: 4,
    title: "Wichtige Aspekte der Altersvorsorge",
    description: "Bewertung verschiedener Aspekte",
    icon: "⭐",
  },
  {
    id: 5,
    title: "Abschluss",
    description: "Finale Anmerkungen",
    icon: "✅",
  },
];

export interface RentenblickFormProps {
  initialData?: Partial<RentenblickData>;
  onStepSave?: (
    step: number,
    stepData: Partial<RentenblickData>,
  ) => Promise<void>;
  onAutoSave?: (
    step: number,
    stepData: Partial<RentenblickData>,
  ) => Promise<void>;
  onComplete?: () => Promise<void>;
  onDownloadPdf?: () => Promise<void>;
  completedSteps?: number[];
  saving?: boolean;
}

export function RentenblickForm({
  initialData = {},
  onStepSave,
  onAutoSave,
  onComplete,
  onDownloadPdf,
  completedSteps = [],
  saving = false,
}: RentenblickFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [confirmedSteps, setConfirmedSteps] =
    useState<number[]>(completedSteps);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [formData, setFormData] = useState<RentenblickData>({
    profession: "",
    currentGrossIncome: 0,
    hasToChurchTax: false,
    currentNetIncome: 0,
    maritalStatus: "Ledig",
    assetSeparation: "Nein",
    healthInsurance: "Gesetzlich/PflichtV",
    healthInsuranceContribution: 0,
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
    ...initialData,
  });

  useEffect(() => {
    setConfirmedSteps(completedSteps);
  }, [completedSteps]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await ApiService.get("/pension-parameters");
        if (!res.data?.success) throw new Error("API Fehler");

        // Public parameters endpoint returns the parameters in `data`
        const p = (res.data.data || {}) as PensionParameters;

        // Map only values that actually exist in this form
        const mappedDefaults: Partial<RentenblickData> = {
          assumedInflation: p.economic_assumptions?.inflation_rate ?? undefined,
          retirementAge: p.demographics?.retirement_age ?? undefined,
          // In the admin UI, life_expectancy is the target age at end of pension
          provisionDuration: p.demographics?.life_expectancy ?? undefined,
          // Sum rate provided by backend for convenience
          healthInsuranceContribution:
            p.social_insurance?.total_insurance_rate ?? undefined,
          statutoryPensionAge: p.demographics?.retirement_age,
          professionalProvisionAge: p.demographics?.retirement_age,
          publicServiceProvisionAge: p.demographics?.retirement_age,
          civilServiceProvisionAge: p.demographics?.retirement_age,
        };

        // Apply defaults without overwriting user-provided initialData unnecessarily
        setFormData((prev) => ({
          ...prev,
          ...Object.fromEntries(
            Object.entries(mappedDefaults).filter(([, v]) => v !== undefined),
          ),
        }));
      } catch (err) {
        console.error(err);
        toast.error("Fehler beim Laden der Einstellungen");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
  const updateFormData = (data: Partial<RentenblickData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const confirmStep = async (stepId: number) => {
    if (!confirmedSteps.includes(stepId)) {
      setConfirmedSteps([...confirmedSteps, stepId]);

      if (onStepSave) {
        await onStepSave(stepId, formData);
      }
    }
  };

  const editStep = (stepId: number) => {
    setConfirmedSteps(confirmedSteps.filter((id) => id !== stepId));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generatePDF = async () => {
    try {
      await confirmStep(currentStep); // Confirm current step first

      // Complete the form and show results
      setShowResults(true);

      if (onComplete) {
        await onComplete();
      }
    } catch (error) {
      console.error("Error completing form:", error);
    }
  };

  const backToForm = () => {
    setShowResults(false);
  };

  const renderStep = () => {
    const isConfirmed = confirmedSteps.includes(currentStep);

    switch (currentStep) {
      case 1:
        return (
          <PersonalFinancialStep
            data={formData}
            updateData={updateFormData}
            isConfirmed={isConfirmed}
          />
        );
      case 2:
        return (
          <ExpectationsStep
            data={formData}
            updateData={updateFormData}
            isConfirmed={isConfirmed}
          />
        );
      case 3:
        return (
          <ContractOverviewStep
            data={formData}
            updateData={updateFormData}
            isConfirmed={isConfirmed}
          />
        );
      case 4:
        return (
          <ImportantAspectsStep
            data={formData}
            updateData={updateFormData}
            isConfirmed={isConfirmed}
          />
        );
      case 5:
        return (
          <ConclusionStep
            data={formData}
            updateData={updateFormData}
            isConfirmed={isConfirmed}
          />
        );
      default:
        return null;
    }
  };

  const progress = (currentStep / steps.length) * 100;
  const isCurrentStepConfirmed = confirmedSteps.includes(currentStep);

  // Show results overview if form is completed
  if (showResults) {
    return (
      <div className="space-y-6">
        {/* Results Header */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-green-800 flex items-center justify-center gap-3">
              <BarChart3 className="h-8 w-8" />
              Ihre Rentenbedarfsanalyse
            </CardTitle>
            <p className="text-green-700 mt-2">
              Basierend auf Ihren Angaben haben wir eine umfassende Analyse
              Ihrer Altersvorsorge erstellt.
            </p>
          </CardHeader>
        </Card>

        {/* Results Content */}
        <PensionResultsOverview
          data={formData}
          desiredPension={formData.pensionWishCurrentValue}
        />

        {/* Action Buttons */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={backToForm}
                variant="outline"
                className="flex items-center gap-2 px-6 py-3"
              >
                <Edit3 className="h-4 w-4" />
                Daten bearbeiten
              </Button>

              {onDownloadPdf && (
                <Button
                  onClick={onDownloadPdf}
                  disabled={saving}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Lädt...
                    </>
                  ) : (
                    <>
                      <FileText className="h-5 w-5" />
                      PDF-Bericht herunterladen
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Step Navigation */}
      <div className="hidden md:block">
        <div className="flex justify-between items-center mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold transition-all duration-300 shadow-lg relative
                    ${
                      confirmedSteps.includes(step.id)
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                        : currentStep === step.id
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-200"
                          : "bg-white text-gray-400 border-2 border-gray-200"
                    }
                  `}
                >
                  {confirmedSteps.includes(step.id) ? (
                    <Lock className="w-5 h-5" />
                  ) : currentStep > step.id ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <span>{step.icon}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div
                    className={`text-sm font-medium ${currentStep >= step.id ? "text-gray-900" : "text-gray-500"}`}
                  >
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 max-w-24">
                    {step.description}
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`
                    flex-1 h-1 mx-4 rounded-full transition-all duration-500
                    ${confirmedSteps.includes(step.id) ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-gray-200"}
                  `}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Form Card */}
      <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-3xl">{steps[currentStep - 1].icon}</div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  {currentStep}. {steps[currentStep - 1].title}
                  {isCurrentStepConfirmed && (
                    <div className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-green-600 font-medium">
                        Bestätigt
                      </span>
                    </div>
                  )}
                </CardTitle>
                <p className="text-gray-600 mt-1">
                  {steps[currentStep - 1].description}
                </p>
              </div>
            </div>
            <div className="hidden md:block text-right">
              <div className="text-sm font-medium text-gray-500 mb-1">
                Fortschritt
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(progress)}%
              </div>
            </div>
          </div>
          <Progress value={progress} className="mt-4 h-2" />
        </CardHeader>

        <CardContent className="p-8">
          <div className="transition-all duration-500 ease-in-out">
            {renderStep()}
          </div>

          <div className="flex justify-between items-center pt-8 mt-8 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 transition-all duration-200 hover:shadow-md disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Zurück
            </Button>

            <div className="flex items-center gap-3">
              {currentStep < steps.length && !isCurrentStepConfirmed && (
                <Button
                  onClick={() => confirmStep(currentStep)}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Speichert...
                    </>
                  ) : (
                    "Daten bestätigen"
                  )}
                </Button>
              )}

              {isCurrentStepConfirmed && currentStep < steps.length && (
                <Button
                  variant="outline"
                  onClick={() => editStep(currentStep)}
                  className="flex items-center gap-2 px-6 py-3 border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  <Edit3 className="h-4 w-4" />
                  Bearbeiten
                </Button>
              )}

              {currentStep === steps.length ? (
                <div className="flex items-center gap-3">
                  {/* Show completion button if not all steps are confirmed yet */}
                  {confirmedSteps.length < steps.length && (
                    <Button
                      onClick={generatePDF}
                      disabled={saving}
                      className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Speichert...
                        </>
                      ) : (
                        <>
                          <BarChart3 className="h-5 w-5" />
                          Analyse erstellen
                        </>
                      )}
                    </Button>
                  )}

                  {/* Show PDF download button if all steps are confirmed */}
                  {confirmedSteps.length === steps.length && onDownloadPdf && (
                    <Button
                      onClick={onDownloadPdf}
                      disabled={saving}
                      className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Lädt...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          PDF herunterladen
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ) : (
                <Button
                  onClick={nextStep}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Weiter
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
