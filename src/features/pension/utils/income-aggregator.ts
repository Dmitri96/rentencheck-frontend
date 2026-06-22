/**
 * Shared income source iteration logic used by both pension results views.
 *
 * PensionResultsOverview and PensionResultsTable both need to walk the same
 * step_3_data contract arrays and normalise each entry to a monthly gross amount.
 * This module owns that traversal so the two display components stay thin.
 */

export interface RawStep3Data {
  payoutContracts?: Array<{ contractType?: string; guaranteedAmount?: string | number }>;
  pensionContracts?: Array<{ contractType?: string; monthlyAmount?: string | number }>;
  additionalIncome?: Array<{ amount?: string | number; frequency?: string; type?: string }>;
  statutoryPensionClaims?: boolean;
  statutoryPensionAmount?: string | number;
  civilServiceProvisionAmount?: string | number;
  professionalProvisionAmount?: string | number;
  publicServiceProvisionAmount?: string | number;
}

export interface IncomeSource {
  /** Human-readable label for the income source */
  label: string;
  /** Monthly gross amount in EUR */
  monthlyGross: number;
}

/**
 * Derive a flat list of monthly income sources from step_3_data.
 *
 * Shared by overview and table components — they apply their own tax/deduction
 * math on top of the amounts returned here.
 */
export function aggregateIncomeSources(step3: RawStep3Data | null | undefined): IncomeSource[] {
  if (!step3) return [];

  const sources: IncomeSource[] = [];

  // 1. Gesetzliche Versorgung (statutory + civil service)
  if (step3.statutoryPensionClaims) {
    const statutory = Number(step3.statutoryPensionAmount || 0);
    const civilService = Number(step3.civilServiceProvisionAmount || 0);
    const total = statutory + civilService;
    if (total > 0) {
      sources.push({ label: "Gesetzl. Versorgung (inkl. Rentensteigerung)", monthlyGross: total });
    }
  }

  // 2. BAV (neu) — Berufsständische Versorgungswerke + Zusatzversorgung öffentlicher Dienst
  const bavTotal =
    Number(step3.professionalProvisionAmount || 0) +
    Number(step3.publicServiceProvisionAmount || 0);
  if (bavTotal > 0) {
    sources.push({ label: "BAV (neu)", monthlyGross: bavTotal });
  }

  // 3. Rentenverträge — group by contract type, sum monthly amounts
  const pensionContracts = step3.pensionContracts ?? [];
  const groupedPensions = pensionContracts.reduce<Record<string, number>>((acc, c) => {
    const type = c.contractType || "Sonstige Rente";
    acc[type] = (acc[type] || 0) + (Number(c.monthlyAmount) || 0);
    return acc;
  }, {});
  for (const [type, amount] of Object.entries(groupedPensions)) {
    if (amount > 0) sources.push({ label: type, monthlyGross: amount });
  }

  // 4. Auszahlungsverträge — convert lump sum to monthly equivalent (20 years = 240 months)
  const payoutContracts = step3.payoutContracts ?? [];
  if (payoutContracts.length > 0) {
    const monthly = payoutContracts.reduce(
      (sum, c) => sum + (Number(c.guaranteedAmount) || 0) / 240,
      0,
    );
    if (monthly > 0) {
      sources.push({ label: "Auszahlungsverträge (äquiv. mtl.)", monthlyGross: monthly });
    }
  }

  // 5. Zusatzeinkommen — group by type, normalise frequency to monthly
  const additional = step3.additionalIncome ?? [];
  const groupedAdditional = additional.reduce<Record<string, number>>((acc, i) => {
    let monthly = Number(i.amount) || 0;
    if (i.frequency === "Jährlich") monthly = monthly / 12;
    if (i.frequency === "Einmalig") monthly = monthly / 240;
    const label = i.type || "Zusatzeinkommen";
    acc[label] = (acc[label] || 0) + monthly;
    return acc;
  }, {});
  for (const [label, amount] of Object.entries(groupedAdditional)) {
    if (amount > 0) sources.push({ label, monthlyGross: amount });
  }

  return sources;
}
