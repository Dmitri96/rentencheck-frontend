"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { RentencheckData } from "@/lib/services/rentencheck-service";

interface ImportantAspectsStepProps {
  data: RentencheckData;
  updateData: (data: Partial<RentencheckData>) => void;
  isConfirmed: boolean;
}

const aspects = [
  {
    key: "availabilityDuringSavings",
    label: "Verfügbarkeit des Guthabens auch während der Sparzeit",
  },
  {
    key: "flexibilityInRetirement",
    label: "Flexibilität in der Rentenphase",
  },
  {
    key: "capitalOrAnnuityChoice",
    label: "Freie Auswahl zwischen Kapitalzahlung oder Verrentung",
  },
  {
    key: "childBenefits",
    label: "Möglichkeit der zusätzlichen Kinderförderung (Staatl. Zulage)",
  },
  {
    key: "initialPaymentOption",
    label: "Option einer Anfangszahlung, Zuzahlung oder Aufstockung",
  },
  {
    key: "taxSavingsInSavingsPhase",
    label: "Steuern sparen und gesetzliche Zuschüsse in der Sparphase",
  },
  {
    key: "lowTaxInPayoutPhase",
    label: "Niedrige Steuerbelastung in der Auszahlungsphase/Verrentung",
  },
  {
    key: "protectionAgainstDisability",
    label: "Absicherung des Sparziels bei BU, Pflege, Unfall, schwere KH",
  },
  {
    key: "survivorBenefits",
    label: "Versorgung der Angehörigen im Todesfall während der Sparzeit",
  },
  {
    key: "deathBenefitsOutsideFamily",
    label: "Leistung im Todesfall auch an Personen außerhalb der Familie",
  },
  {
    key: "protectionAgainstThirdParties",
    label: "Schutz vor Zugriff von Dritten (z.B. Hartz IV oder bei Insolvenz)",
  },
];

const ratingOptions = [
  { value: "unwichtig", label: "unwichtig" },
  { value: "weniger wichtig", label: "weniger wichtig" },
  { value: "neutral", label: "neutral" },
  { value: "wichtig", label: "wichtig" },
  { value: "sehr wichtig", label: "sehr wichtig" },
];

export function ImportantAspectsStep({ data, updateData, isConfirmed }: ImportantAspectsStepProps) {
  const updateAspectRating = (aspectKey: string, value: string) => {
    updateData({
      aspectRatings: {
        ...data.aspectRatings,
        [aspectKey]: value,
      },
    });
  };

  return (
    <div className={`space-y-8 ${isConfirmed ? "opacity-60 pointer-events-none" : ""}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left p-2 w-1/2"></th>
              {ratingOptions.map((option) => (
                <th
                  key={option.value}
                  className="text-center p-2 text-sm font-medium text-muted-foreground"
                >
                  {option.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {aspects.map((aspect) => (
              <tr key={aspect.key} className="border-b border-border-subtle">
                <td className="p-3 text-sm text-foreground">{aspect.label}</td>
                {ratingOptions.map((option) => (
                  <td key={option.value} className="p-3 text-center">
                    <RadioGroup
                      value={data.aspectRatings[aspect.key as keyof typeof data.aspectRatings]}
                      onValueChange={(value) => updateAspectRating(aspect.key, value)}
                      disabled={isConfirmed}
                    >
                      <div className="flex items-center justify-center">
                        <RadioGroupItem value={option.value} id={`${aspect.key}-${option.value}`} />
                      </div>
                    </RadioGroup>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-6 pt-6 border-t border-border">
        <div className="space-y-4">
          <Label className="text-sm">Ist es für Sie akzeptabel, dass...</Label>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-foreground mb-2">
                ...die Art des Produktes und die Auswahl des Anbieters von der Zustimmung des
                Arbeitgebers mit abhängig sind?
              </p>
              <RadioGroup
                value={data.productDependsOnEmployer}
                onValueChange={(value) => updateData({ productDependsOnEmployer: value })}
                disabled={isConfirmed}
                className="flex space-x-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Ja" id="employer-ja" />
                  <Label htmlFor="employer-ja" className="text-sm cursor-pointer">
                    Ja
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Nein" id="employer-nein" />
                  <Label htmlFor="employer-nein" className="text-sm cursor-pointer">
                    Nein
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <p className="text-sm text-foreground mb-2">
                ...wegen der Nutzung von Steuervorteilen in der Sparzeit Einschränkungen (z.B. nicht
                beleihbar) entstehen?
              </p>
              <RadioGroup
                value={data.taxLimitationsInSavingsPhase}
                onValueChange={(value) => updateData({ taxLimitationsInSavingsPhase: value })}
                disabled={isConfirmed}
                className="flex space-x-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Ja" id="tax-ja" />
                  <Label htmlFor="tax-ja" className="text-sm cursor-pointer">
                    Ja
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Nein" id="tax-nein" />
                  <Label htmlFor="tax-nein" className="text-sm cursor-pointer">
                    Nein
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <p className="text-sm text-foreground mb-2">
                ...Ihr Rentenkonzept nur dem Zweck der Altersversorgung dient (Rentenzahlung) und
                keine andere Verwendung zulässt?
              </p>
              <RadioGroup
                value={data.onlyForRetirement}
                onValueChange={(value) => updateData({ onlyForRetirement: value })}
                disabled={isConfirmed}
                className="flex space-x-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Ja" id="retirement-ja" />
                  <Label htmlFor="retirement-ja" className="text-sm cursor-pointer">
                    Ja
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Nein" id="retirement-nein" />
                  <Label htmlFor="retirement-nein" className="text-sm cursor-pointer">
                    Nein
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>
      </div>

      {isConfirmed && (
        <div className="bg-[color-mix(in_oklch,var(--success)_10%,var(--background))] p-4 rounded-lg border border-[color-mix(in_oklch,var(--success)_30%,var(--background))]">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span className="text-success font-medium">
              Wichtige Aspekte der Altersvorsorge bestätigt
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
