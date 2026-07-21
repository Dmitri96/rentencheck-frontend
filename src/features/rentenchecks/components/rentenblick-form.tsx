"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  FileText,
  Lock,
  Star,
  Target,
  User2,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { PersonalFinancialStep } from "./form-steps/personal-financial-step";
import { ExpectationsStep } from "./form-steps/expectations-step";
import { ContractOverviewStep } from "./form-steps/contract-overview-step";
import { ImportantAspectsStep } from "./form-steps/important-aspects-step";
import { ConclusionStep } from "./form-steps/conclusion-step";
import { RentenblickResults, useRentenblickForm } from "@/features/rentenchecks";
import type { RentencheckData } from "@/lib/services/rentencheck-service";
import type { LucideIcon } from "lucide-react";

const steps: Array<{
  id: number;
  title: string;
  description: string;
  Icon: LucideIcon;
}> = [
  {
    id: 1,
    title: "Persönliche und finanzielle Angaben",
    description: "Grunddaten und Einkommen",
    Icon: User2,
  },
  { id: 2, title: "Ihre Erwartungen", description: "Rentenwünsche und Ziele", Icon: Target },
  { id: 3, title: "Vertragsübersicht", description: "Bestehende Verträge", Icon: FileText },
  {
    id: 4,
    title: "Wichtige Aspekte der Altersvorsorge",
    description: "Bewertung verschiedener Aspekte",
    Icon: Star,
  },
  { id: 5, title: "Abschluss", description: "Finale Anmerkungen", Icon: CheckCircle2 },
];

export interface RentenblickFormProps {
  initialData?: Partial<RentencheckData>;
  onStepSave?: (stepId: number, data: RentencheckData) => Promise<void>;
  onAutoSave?: (data: RentencheckData) => Promise<void>;
  onComplete?: () => Promise<void>;
  onDownloadPdf?: () => Promise<void>;
  completedSteps?: number[];
  saving?: boolean;
  /** Needed by the results view to fetch the backend analysis. */
  clientId?: number;
  rentencheckId?: number;
}

/**
 * Rentenblick wizard shell.
 *
 * State + side-effects live in useRentenblickForm. The shell renders:
 *   - top stepper with token-driven discs (no emoji, no gradients)
 *   - the active step component (crossfade on transition)
 *   - prev/confirm/edit/finish navigation
 *   - <RentenblickResults> when showResults is true
 */
export function RentenblickForm({
  initialData = {},
  onStepSave,
  onAutoSave,
  onComplete,
  onDownloadPdf,
  completedSteps = [],
  saving = false,
  clientId,
  rentencheckId,
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

  void onAutoSave;

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
        clientId={clientId}
        rentencheckId={rentencheckId}
        saving={saving}
        onEdit={backToForm}
        onDownloadPdf={onDownloadPdf}
      />
    );
  }

  const active = steps[currentStep - 1]!;
  const ActiveIcon = active.Icon;

  return (
    <div className="space-y-8">
      {/* Step Navigation */}
      <nav aria-label="Schritt-Fortschritt" className="hidden md:block">
        <ol className="flex items-start justify-between">
          {steps.map((step, index) => {
            const isConfirmed = confirmedSteps.includes(step.id);
            const isCurrent = currentStep === step.id;
            const isPast = currentStep > step.id;
            const StepIcon = step.Icon;

            const lineFilled = isConfirmed && confirmedSteps.includes(step.id + 1);

            return (
              <li key={step.id} className="flex-1 flex items-start">
                <div className="flex flex-col items-center text-center w-full">
                  {/* Disc */}
                  <div
                    className={[
                      "w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-[180ms]",
                      isConfirmed
                        ? "bg-primary text-primary-foreground"
                        : isCurrent
                          ? "border-2 border-primary text-primary bg-surface"
                          : isPast
                            ? "border border-border bg-surface text-foreground"
                            : "bg-muted text-muted-foreground border border-border-subtle",
                    ].join(" ")}
                  >
                    {isConfirmed ? (
                      <motion.span
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <Check className="w-4 h-4" strokeWidth={2} />
                      </motion.span>
                    ) : (
                      <StepIcon className="w-4 h-4" strokeWidth={1.75} />
                    )}
                  </div>

                  {/* Labels */}
                  <div className="mt-3 px-2">
                    <p
                      className={`text-sm leading-tight ${
                        isCurrent || isConfirmed
                          ? "text-foreground font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.id}. {step.title}
                    </p>
                    <p className="text-xs text-[var(--ink-tertiary)] mt-1 max-w-[10rem] mx-auto">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connector */}
                {index < steps.length - 1 && (
                  <div
                    aria-hidden
                    className={`h-px flex-1 mt-[18px] transition-colors duration-[180ms] ${
                      lineFilled || isConfirmed ? "bg-primary" : "bg-border-subtle"
                    }`}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Main Form Card */}
      <Card>
        <CardHeader className="border-b pb-6 [.border-b]:pb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 min-w-0">
              <div className="w-10 h-10 rounded-md border border-border bg-surface flex items-center justify-center shrink-0">
                <ActiveIcon className="w-5 h-5 text-foreground" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-3 flex-wrap">
                  <span>
                    {currentStep}. {active.title}
                  </span>
                  {isCurrentStepConfirmed && (
                    <span className="inline-flex items-center gap-1.5 text-sm text-success font-sans font-medium">
                      <Lock className="w-4 h-4" strokeWidth={1.5} />
                      Bestätigt
                    </span>
                  )}
                </CardTitle>
                <p className="mt-1 text-muted-foreground">{active.description}</p>
              </div>
            </div>
            <div className="hidden md:block text-right shrink-0">
              <p className="label-uppercase">Fortschritt</p>
              <p
                className="mt-1 text-[1.5rem] leading-none currency"
                style={{ fontFamily: "var(--font-display), Georgia, serif", fontWeight: 500 }}
              >
                {Math.round(progress)}%
              </p>
            </div>
          </div>
          <Progress value={progress} className="mt-5 h-1.5" />
        </CardHeader>

        <CardContent className="px-8 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between items-center pt-8 mt-8 border-t border-border-subtle">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
              <ChevronLeft className="h-4 w-4" />
              Zurück
            </Button>

            <div className="flex items-center gap-3">
              {currentStep < steps.length && !isCurrentStepConfirmed && (
                <Button onClick={() => confirmStep(currentStep)} disabled={saving}>
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                      Speichert…
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Daten bestätigen
                    </>
                  )}
                </Button>
              )}

              {isCurrentStepConfirmed && currentStep < steps.length && (
                <Button variant="outline" onClick={() => editStep(currentStep)}>
                  <Edit3 className="h-4 w-4" />
                  Bearbeiten
                </Button>
              )}

              {currentStep === steps.length ? (
                <div className="flex items-center gap-3">
                  {confirmedSteps.length < steps.length && (
                    <Button onClick={generatePDF} disabled={saving}>
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                          Speichert…
                        </>
                      ) : (
                        <>
                          <BarChart3 className="h-4 w-4" />
                          Analyse erstellen
                        </>
                      )}
                    </Button>
                  )}

                  {confirmedSteps.length === steps.length && onDownloadPdf && (
                    <Button onClick={onDownloadPdf} disabled={saving}>
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                          Lädt…
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          PDF herunterladen
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ) : (
                <Button onClick={nextStep}>
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
