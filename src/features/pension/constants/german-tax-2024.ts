/**
 * Frozen 2024 German tax constants for the disability income diagram.
 *
 * These rates are used only for the educational disability income visualisation
 * (DisabilityIncomeDiagram). They are NOT used for actual pension gap calculations —
 * those pull live parameters from the /pension-parameters endpoint.
 *
 * Update this file when a new tax year is introduced and the visual needs updating.
 */

export const GERMAN_TAX_2024 = {
  // Employee share of social security contributions (~20.25%)
  socialSecurityRate: 0.2025,

  // Progressive income tax bracket thresholds (annual taxable income in EUR)
  incomeTaxBrackets: [
    { upTo: 10908, rate: 0 },
    { upTo: 15999, rate: 0.14, baseAmount: 0, baseThreshold: 10908 },
    { upTo: 62809, rate: 0.24, baseAmount: 713, baseThreshold: 15999 },
    { upTo: 277825, rate: 0.42, baseAmount: 11934, baseThreshold: 62809 },
    { upTo: Infinity, rate: 0.45, baseAmount: 102130, baseThreshold: 277825 },
  ] as const,

  // Solidarity surcharge on income tax
  solidaritySurchargeRate: 0.055,
} as const;
