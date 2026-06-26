"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { RentencheckData } from "@/lib/services/rentencheck-service";

interface PersonalFinancialStepProps {
  data: RentencheckData;
  updateData: (data: Partial<RentencheckData>) => void;
  isConfirmed: boolean;
}

export function PersonalFinancialStep({
  data,
  updateData,
  isConfirmed,
}: PersonalFinancialStepProps) {
  return (
    <div className={`space-y-8 ${isConfirmed ? "opacity-60 pointer-events-none" : ""}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="profession" className="text-sm">
            Ihr Beruf
          </Label>
          <Input
            id="profession"
            value={data.profession}
            onChange={(e) => updateData({ profession: e.target.value })}
            placeholder=""
            disabled={isConfirmed}
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="currentGrossIncome" className="text-sm">
            Aktuelles Bruttoeinkommen (€)
          </Label>
          <Input
            id="currentGrossIncome"
            type="number"
            value={data.currentGrossIncome || ""}
            onChange={(e) =>
              updateData({
                currentGrossIncome: Number.parseFloat(e.target.value) || 0,
              })
            }
            placeholder="0"
            disabled={isConfirmed}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="currentNetIncome" className="text-sm">
            Aktuelles Nettoeinkommen (€)
          </Label>
          <Input
            id="currentNetIncome"
            type="number"
            value={data.currentNetIncome || ""}
            onChange={(e) =>
              updateData({
                currentNetIncome: Number.parseFloat(e.target.value) || 0,
              })
            }
            placeholder="0"
            disabled={isConfirmed}
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="maritalStatus" className="text-sm">
            Familienstand
          </Label>
          <Select
            value={data.maritalStatus}
            onValueChange={(value) => updateData({ maritalStatus: value })}
            disabled={isConfirmed}
          >
            <SelectTrigger>
              <SelectValue placeholder="Auswählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Ledig">Ledig</SelectItem>
              <SelectItem value="Verheiratet">Verheiratet</SelectItem>
              <SelectItem value="Geschieden">Geschieden</SelectItem>
              <SelectItem value="Verwitwet">Verwitwet</SelectItem>
              <SelectItem value="Lebenspartnerschaft">Lebenspartnerschaft</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="assetSeparation" className="text-sm">
          Gütertrennung
        </Label>
        <Select
          value={data.assetSeparation}
          onValueChange={(value) => updateData({ assetSeparation: value })}
          disabled={isConfirmed}
        >
          <SelectTrigger>
            <SelectValue placeholder="Auswählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Nein">Nein</SelectItem>
            <SelectItem value="Ja">Ja</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <Label className="text-sm">Krankenversicherung</Label>
        <RadioGroup
          value={data.healthInsurance}
          onValueChange={(value) => updateData({ healthInsurance: value })}
          disabled={isConfirmed}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Gesetzlich/PflichtV" id="gesetzlich-pflicht" />
            <Label htmlFor="gesetzlich-pflicht" className="text-sm cursor-pointer">
              Gesetzlich/PflichtV
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Gesetzlich/FamilienV" id="gesetzlich-familien" />
            <Label htmlFor="gesetzlich-familien" className="text-sm cursor-pointer">
              Gesetzlich/FamilienV
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Gesetzlich/Freiwillig" id="gesetzlich-freiwillig" />
            <Label htmlFor="gesetzlich-freiwillig" className="text-sm cursor-pointer">
              Gesetzlich/Freiwillig
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Privat" id="privat" />
            <Label htmlFor="privat" className="text-sm cursor-pointer">
              Privat
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Beihilfe" id="beihilfe" />
            <Label htmlFor="beihilfe" className="text-sm cursor-pointer">
              Beihilfe
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Freie Heilfürsorge" id="freie-heilfuersorge" />
            <Label htmlFor="freie-heilfuersorge" className="text-sm cursor-pointer">
              Freie Heilfürsorge
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <Label className="text-sm">Kirchensteuer</Label>
        <RadioGroup
          value={data.hasToChurchTax ? "Ja" : "Nein"}
          onValueChange={(value) => updateData({ hasToChurchTax: value === "Ja" })}
          disabled={isConfirmed}
          className="grid grid-cols-2 gap-4 max-w-md"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Ja" id="kirche-ja" />
            <Label htmlFor="kirche-ja" className="text-sm cursor-pointer">
              Ja
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Nein" id="kirche-nein" />
            <Label htmlFor="kirche-nein" className="text-sm cursor-pointer">
              Nein
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label htmlFor="healthInsuranceContribution" className="text-sm">
          Beitragswert KV (€)
        </Label>
        <Input
          id="healthInsuranceContribution"
          type="number"
          value={data.healthInsuranceContribution || ""}
          onChange={(e) =>
            updateData({
              healthInsuranceContribution: Number.parseFloat(e.target.value) || 0,
            })
          }
          placeholder="0"
          disabled={isConfirmed}
        />
      </div>

      {isConfirmed && (
        <div className="bg-[color-mix(in_oklch,var(--success)_10%,var(--background))] p-4 rounded-lg border border-[color-mix(in_oklch,var(--success)_30%,var(--background))]">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span className="text-success font-medium">
              Persönliche und finanzielle Angaben bestätigt
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
