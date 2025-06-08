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
import type { RentenblickData } from "../rentenblick-form";

interface PersonalFinancialStepProps {
  data: RentenblickData;
  updateData: (data: Partial<RentenblickData>) => void;
  isConfirmed: boolean;
}

export function PersonalFinancialStep({
  data,
  updateData,
  isConfirmed,
}: PersonalFinancialStepProps) {
  return (
    <div
      className={`space-y-8 ${isConfirmed ? "opacity-60 pointer-events-none" : ""}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label
            htmlFor="profession"
            className="text-sm font-semibold text-gray-700"
          >
            Ihr Beruf
          </Label>
          <Input
            id="profession"
            value={data.profession}
            onChange={(e) => updateData({ profession: e.target.value })}
            placeholder=""
            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
            disabled={isConfirmed}
          />
        </div>

        <div className="space-y-3">
          <Label
            htmlFor="currentGrossIncome"
            className="text-sm font-semibold text-gray-700"
          >
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
            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
            disabled={isConfirmed}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label
            htmlFor="currentNetIncome"
            className="text-sm font-semibold text-gray-700"
          >
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
            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
            disabled={isConfirmed}
          />
        </div>

        <div className="space-y-3">
          <Label
            htmlFor="maritalStatus"
            className="text-sm font-semibold text-gray-700"
          >
            Familienstand
          </Label>
          <Select
            value={data.maritalStatus}
            onValueChange={(value) => updateData({ maritalStatus: value })}
            disabled={isConfirmed}
          >
            <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Auswählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Ledig">Ledig</SelectItem>
              <SelectItem value="Verheiratet">Verheiratet</SelectItem>
              <SelectItem value="Geschieden">Geschieden</SelectItem>
              <SelectItem value="Verwitwet">Verwitwet</SelectItem>
              <SelectItem value="Lebenspartnerschaft">
                Lebenspartnerschaft
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <Label
          htmlFor="assetSeparation"
          className="text-sm font-semibold text-gray-700"
        >
          Gütertrennung
        </Label>
        <Select
          value={data.assetSeparation}
          onValueChange={(value) => updateData({ assetSeparation: value })}
          disabled={isConfirmed}
        >
          <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
            <SelectValue placeholder="Auswählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Nein">Nein</SelectItem>
            <SelectItem value="Ja">Ja</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <Label className="text-sm font-semibold text-gray-700">
          Krankenversicherung
        </Label>
        <RadioGroup
          value={data.healthInsurance}
          onValueChange={(value) => updateData({ healthInsurance: value })}
          disabled={isConfirmed}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="Gesetzlich/PflichtV"
              id="gesetzlich-pflicht"
            />
            <Label
              htmlFor="gesetzlich-pflicht"
              className="text-sm cursor-pointer"
            >
              Gesetzlich/PflichtV
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="Gesetzlich/FamilienV"
              id="gesetzlich-familien"
            />
            <Label
              htmlFor="gesetzlich-familien"
              className="text-sm cursor-pointer"
            >
              Gesetzlich/FamilienV
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="Gesetzlich/Freiwillig"
              id="gesetzlich-freiwillig"
            />
            <Label
              htmlFor="gesetzlich-freiwillig"
              className="text-sm cursor-pointer"
            >
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
            <RadioGroupItem
              value="Freie Heilfürsorge"
              id="freie-heilfuersorge"
            />
            <Label
              htmlFor="freie-heilfuersorge"
              className="text-sm cursor-pointer"
            >
              Freie Heilfürsorge
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label
          htmlFor="healthInsuranceContribution"
          className="text-sm font-semibold text-gray-700"
        >
          Beitragswert KV (€)
        </Label>
        <Input
          id="healthInsuranceContribution"
          type="number"
          value={data.healthInsuranceContribution || ""}
          onChange={(e) =>
            updateData({
              healthInsuranceContribution:
                Number.parseFloat(e.target.value) || 0,
            })
          }
          placeholder="0"
          className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
          disabled={isConfirmed}
        />
      </div>

      {isConfirmed && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-800 font-medium">
              Persönliche und finanzielle Angaben bestätigt
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
