"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RentencheckData } from "@/lib/services/rentencheck-service";

interface ExpectationsStepProps {
  data: RentencheckData;
  updateData: (data: Partial<RentencheckData>) => void;
  isConfirmed: boolean;
}

export function ExpectationsStep({ data, updateData, isConfirmed }: ExpectationsStepProps) {
  return (
    <div className={`space-y-8 ${isConfirmed ? "opacity-60 pointer-events-none" : ""}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="currentAge" className="text-sm font-semibold text-gray-700">
            Aktuelles Alter
          </Label>
          <Input
            id="currentAge"
            type="number"
            value={data.currentAge || ""}
            onChange={(e) => updateData({ currentAge: Number.parseInt(e.target.value) || 0 })}
            placeholder="30"
            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
            disabled={isConfirmed}
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="retirementAge" className="text-sm font-semibold text-gray-700">
            Mit welchem Alter wollen Sie in Ruhestand gehen?
          </Label>
          <Input
            id="retirementAge"
            type="number"
            value={data.retirementAge || ""}
            onChange={(e) => updateData({ retirementAge: Number.parseInt(e.target.value) || 0 })}
            placeholder="67"
            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
            disabled={isConfirmed}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="pensionWishCurrentValue" className="text-sm font-semibold text-gray-700">
            Rentenwunsch in heutiger Kaufkraft (€)
          </Label>
          <Input
            id="pensionWishCurrentValue"
            type="number"
            value={data.pensionWishCurrentValue || ""}
            onChange={(e) =>
              updateData({ pensionWishCurrentValue: Number.parseFloat(e.target.value) || 0 })
            }
            placeholder="0"
            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
            disabled={isConfirmed}
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="guaranteedAmount" className="text-sm font-semibold text-gray-700">
            Wie viel sollte davon garantiert sein? (€)
          </Label>
          <Input
            id="guaranteedAmount"
            type="number"
            value={data.guaranteedAmount || ""}
            onChange={(e) =>
              updateData({ guaranteedAmount: Number.parseFloat(e.target.value) || 0 })
            }
            placeholder="0"
            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
            disabled={isConfirmed}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="provisionDuration" className="text-sm font-semibold text-gray-700">
            Wie lange sollte die Versorgung reichen?
          </Label>
          <Input
            id="provisionDuration"
            type="number"
            value={data.provisionDuration || ""}
            onChange={(e) =>
              updateData({ provisionDuration: Number.parseInt(e.target.value) || 0 })
            }
            placeholder="92"
            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
            disabled={isConfirmed}
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="assumedInflation" className="text-sm font-semibold text-gray-700">
            Angenommene Inflation p.a. (%)
          </Label>
          <Input
            id="assumedInflation"
            type="number"
            value={data.assumedInflation || ""}
            onChange={(e) =>
              updateData({ assumedInflation: Number.parseFloat(e.target.value) || 0 })
            }
            placeholder="0"
            step="0.1"
            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
            disabled={isConfirmed}
          />
        </div>
      </div>

      {isConfirmed && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-800 font-medium">Ihre Erwartungen bestätigt</span>
          </div>
        </div>
      )}
    </div>
  );
}
