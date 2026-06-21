"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BarChart3, CheckCircle, ChevronLeft, ChevronRight, Edit3, Lock } from "lucide-react";
import { PersonalFinancialStep } from "./form-steps/personal-financial-step";
import { ExpectationsStep } from "./form-steps/expectations-step";
import { ContractOverviewStep } from "./form-steps/contract-overview-step";
import { ImportantAspectsStep } from "./form-steps/important-aspects-step";
import { ConclusionStep } from "./form-steps/conclusion-step";
import { RentenblickResults, useRentenblickForm } from "@/features/rentenchecks";

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
  onStepSave?: (stepId: number, data: RentenblickData) => Promise<void>;
  onAutoSave?: (data: RentenblickData) => Promise<void>;
  onComplete?: () => Promise<void>;
  onDownloadPdf?: () => Promise<void>;
  completedSteps?: number[];
  saving?: boolean;
}

/**
 * Rentenblick wizard shell.
 *
 * All state + side effects live in `useRentenblickForm` (extracted from this
 * file — used to be 630 LOC). The shell is pure rendering glue:
 *   - stepper (top)
 *   - one of 5 step components (middle)
 *   - prev/next/confirm/edit/finish nav (bottom)
 *   - <RentenblickResults> when showResults is true
 *
 * If you're adding a new step, change `steps` + the switch in renderStep
 * and update RentenblickData. State plumbing is already taken care of.
 */
export function RentenblickForm({
  initialData = {},
  onStepSave,
  onAutoSave,
  onComplete,
  onDownloadPdf,
  completedSteps = [],
  saving = false,
}: RentenblickFormProps) {
  const {
    currentStep,
    confirmedSteps,
    showResults,
    formData,
    progress,
    isCurrentStepConfirmed,
    updateFormData,
    confirmStep,
    editStep,
    nextStep,
    prevStep,
    generatePDF,
    backToForm,
  } = useRentenblickForm({
    initialData,
    completedSteps,
    onStepSave,
    onComplete,
  });

  void onAutoSave; // reserved for phase-11 autosave; intentionally not wired today

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
          <ExpectationsStep data={formData} updateData={updateFormData} isConfirmed={isConfirmed} />
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
          <ConclusionStep data={formData} updateData={updateFormData} isConfirmed={isConfirmed} />
        );
      default:
        return null;
    }
  };

  if (showResults) {
    return (
      <RentenblickResults
        data={formData}
        saving={saving}
        onEdit={backToForm}
        onDownloadPdf={onDownloadPdf}
      />
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
                  <div className="text-xs text-gray-500 max-w-24">{step.description}</div>
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
                      <span className="text-sm text-green-600 font-medium">Bestätigt</span>
                    </div>
                  )}
                </CardTitle>
                <p className="text-gray-600 mt-1">{steps[currentStep - 1].description}</p>
              </div>
            </div>
            <div className="hidden md:block text-right">
              <div className="text-sm font-medium text-gray-500 mb-1">Fortschritt</div>
              <div className="text-2xl font-bold text-blue-600">{Math.round(progress)}%</div>
            </div>
          </div>
          <Progress value={progress} className="mt-4 h-2" />
        </CardHeader>

        <CardContent className="p-8">
          <div className="transition-all duration-500 ease-in-out">{renderStep()}</div>

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
