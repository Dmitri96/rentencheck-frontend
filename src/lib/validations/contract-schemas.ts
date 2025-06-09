import { z } from 'zod'

/**
 * German error messages for contract validation
 * These provide clear, user-friendly feedback to help users understand what's required
 */
const GERMAN_ERRORS = {
  required: 'Dieses Feld ist erforderlich',
  invalidNumber: 'Bitte geben Sie eine gültige Zahl ein',
  minAmount: 'Der Betrag muss größer als 0 sein',
  minYear: 'Das Jahr muss mindestens 1900 sein',
  maxYear: 'Das Jahr darf nicht in der Zukunft liegen',
  invalidContract: 'Bitte geben Sie eine gültige Vertragsnummer ein',
  invalidCompany: 'Bitte geben Sie eine gültige Gesellschaft ein',
  invalidType: 'Bitte geben Sie eine gültige Art ein'
}

/**
 * Validation schema for payout contracts (Auszahlungsverträge)
 * Ensures all required fields are properly filled for accurate pension calculations
 */
export const PayoutContractSchema = z.object({
  contract: z
    .string()
    .min(1, GERMAN_ERRORS.required)
    .max(100, 'Vertragsnummer darf maximal 100 Zeichen haben'),
  
  company: z
    .string()
    .min(1, GERMAN_ERRORS.required)
    .max(100, 'Gesellschaftsname darf maximal 100 Zeichen haben'),
  
  contractType: z
    .string()
    .min(1, 'Bitte wählen Sie einen Vertragstyp aus')
    .refine(
      (val) => ['Kapital-Lebensvers.', 'Rentenvers.', 'Direktvers.', 'Investment', 'andere Art'].includes(val),
      'Ungültiger Vertragstyp'
    ),
  
  interestRate: z
    .number()
    .min(0, 'Zinssatz kann nicht negativ sein')
    .max(100, 'Zinssatz kann nicht über 100% liegen'),
  
  maturityYear: z
    .number()
    .int('Jahr muss eine ganze Zahl sein')
    .min(1900, GERMAN_ERRORS.minYear)
    .max(2100, 'Jahr darf nicht über 2100 liegen'),
  
  guaranteedAmount: z
    .number()
    .min(0.01, 'Garantierter Betrag muss mindestens 0,01 € betragen')
    .max(10000000, 'Betrag ist zu hoch'),
  
  projectedAmount: z
    .number()
    .min(0, 'Prognostizierter Betrag kann nicht negativ sein')
    .max(10000000, 'Betrag ist zu hoch')
})

/**
 * Validation schema for pension contracts (Rentenverträge)
 * Validates ongoing income streams for retirement planning
 */
export const PensionContractSchema = z.object({
  contract: z
    .string()
    .min(1, GERMAN_ERRORS.required)
    .max(100, 'Vertragsnummer darf maximal 100 Zeichen haben'),
  
  company: z
    .string()
    .min(1, GERMAN_ERRORS.required)
    .max(100, 'Gesellschaftsname darf maximal 100 Zeichen haben'),
  
  contractType: z
    .string()
    .min(1, 'Bitte wählen Sie einen Vertragstyp aus')
    .refine(
      (val) => ['Basis-Rente', 'Riester-Rente', 'BAV-Rente', 'Mieteinnahme', 'andere Art'].includes(val),
      'Ungültiger Vertragstyp'
    ),
  
  interestRate: z
    .number()
    .min(0, 'Zinssatz kann nicht negativ sein')
    .max(100, 'Zinssatz kann nicht über 100% liegen'),
  
  pensionFromYear: z
    .number()
    .int('Jahr muss eine ganze Zahl sein')
    .min(1900, GERMAN_ERRORS.minYear)
    .max(2100, 'Jahr darf nicht über 2100 liegen'),
  
  pensionAmount: z
    .number()
    .min(0.01, 'Renten-Betrag muss mindestens 0,01 € betragen')
    .max(100000, 'Monatliche Rente ist zu hoch')
})

/**
 * Validation schema for additional income (Zusätzliche Einkünfte)
 * Validates future income streams not covered by standard pension contracts
 */
export const AdditionalIncomeSchema = z.object({
  type: z
    .string()
    .min(1, GERMAN_ERRORS.required)
    .max(100, 'Einkunftsart darf maximal 100 Zeichen haben'),
  
  fromYear: z
    .number()
    .int('Jahr muss eine ganze Zahl sein')
    .min(1900, GERMAN_ERRORS.minYear)
    .max(2100, 'Jahr darf nicht über 2100 liegen'),
  
  amount: z
    .number()
    .min(0.01, 'Betrag muss mindestens 0,01 € betragen')
    .max(1000000, 'Betrag ist zu hoch'),
  
  frequency: z
    .string()
    .min(1, 'Bitte wählen Sie eine Periodizität aus')
    .refine(
      (val) => ['Einmalig', 'Monatlich', 'Jährlich'].includes(val),
      'Ungültige Periodizität'
    )
})

// Export type definitions for TypeScript
export type PayoutContractData = z.infer<typeof PayoutContractSchema>
export type PensionContractData = z.infer<typeof PensionContractSchema>
export type AdditionalIncomeData = z.infer<typeof AdditionalIncomeSchema>

/**
 * Helper function to format Zod validation errors for German UI
 * Extracts the first error message for each field to display in forms
 */
export const formatValidationErrors = (error: z.ZodError) => {
  const errors: Record<string, string> = {}
  
  error.errors.forEach((err) => {
    const path = err.path.join('.')
    if (!errors[path]) {
      errors[path] = err.message
    }
  })
  
  return errors
} 