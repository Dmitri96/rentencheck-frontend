import { z } from "zod";

/**
 * German error messages for Step 1 + Step 2 validation.
 * Mirrors the tone/format used in contract-schemas.ts.
 */
const GERMAN_ERRORS = {
  required: "Dieses Feld ist erforderlich",
  invalidNumber: "Bitte geben Sie eine gültige Zahl ein",
  notNegative: "Der Wert darf nicht negativ sein",
};

/**
 * All 16 German Bundesländer, used to derive the Kirchensteuer rate
 * (8% in Bayern/Baden-Württemberg, 9% everywhere else).
 */
export const FEDERAL_STATES = [
  "Baden-Württemberg",
  "Bayern",
  "Berlin",
  "Brandenburg",
  "Bremen",
  "Hamburg",
  "Hessen",
  "Mecklenburg-Vorpommern",
  "Niedersachsen",
  "Nordrhein-Westfalen",
  "Rheinland-Pfalz",
  "Saarland",
  "Sachsen",
  "Sachsen-Anhalt",
  "Schleswig-Holstein",
  "Thüringen",
] as const;

/**
 * Validation schema for Step 1 (Persönliche und finanzielle Angaben).
 * Incomes must be non-negative; federalState is optional but must be a
 * known Bundesland when provided.
 */
export const PersonalFinancialStepSchema = z.object({
  profession: z.string().min(1, GERMAN_ERRORS.required),
  currentGrossIncome: z.number().min(0, GERMAN_ERRORS.notNegative),
  currentNetIncome: z.number().min(0, GERMAN_ERRORS.notNegative),
  maritalStatus: z.string().min(1, GERMAN_ERRORS.required),
  assetSeparation: z.string().min(1, GERMAN_ERRORS.required),
  healthInsurance: z.string().min(1, GERMAN_ERRORS.required),
  healthInsuranceContribution: z.number().min(0, GERMAN_ERRORS.notNegative),
  hasToChurchTax: z.boolean().optional(),
  federalState: z.enum(FEDERAL_STATES).optional(),
  hasChildren: z.boolean().optional(),
});

/**
 * Validation schema for Step 2 (Ihre Erwartungen).
 * retirementAge must exceed currentAge — enforced via cross-field refine.
 */
export const ExpectationsStepSchema = z
  .object({
    currentAge: z
      .number()
      .int("Das Alter muss eine ganze Zahl sein")
      .min(18, "Das aktuelle Alter muss mindestens 18 Jahre betragen")
      .max(100, "Das aktuelle Alter darf maximal 100 Jahre betragen"),
    retirementAge: z
      .number()
      .int("Das Rentenalter muss eine ganze Zahl sein")
      .min(50, "Das Rentenalter muss mindestens 50 Jahre betragen")
      .max(100, "Das Rentenalter darf maximal 100 Jahre betragen"),
    pensionWishCurrentValue: z.number().gt(0, "Der Rentenwunsch muss größer als 0 sein"),
    guaranteedAmount: z.number().min(0, GERMAN_ERRORS.notNegative),
    provisionDuration: z
      .number()
      .int("Die Versorgungsdauer muss eine ganze Zahl sein")
      .min(0, "Die Versorgungsdauer muss mindestens 0 Jahre betragen")
      .max(110, "Die Versorgungsdauer darf maximal 110 Jahre betragen"),
    assumedInflation: z
      .number()
      .min(0, "Die angenommene Inflation muss mindestens 0% betragen")
      .max(10, "Die angenommene Inflation darf maximal 10% betragen"),
  })
  .refine((data) => data.retirementAge > data.currentAge, {
    message: "Renteneintrittsalter muss über dem aktuellen Alter liegen",
    path: ["retirementAge"],
  });

export type PersonalFinancialStepData = z.infer<typeof PersonalFinancialStepSchema>;
export type ExpectationsStepData = z.infer<typeof ExpectationsStepSchema>;

export { GERMAN_ERRORS as STEP_GERMAN_ERRORS };
export { formatValidationErrors } from "./contract-schemas";
