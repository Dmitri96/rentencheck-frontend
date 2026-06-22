"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Edit, Save, X } from "lucide-react";
import type { RentencheckData } from "@/lib/services/rentencheck-service";
import type { UseContractManagementReturn } from "@/hooks/use-contract-management";
import type { PensionContractData } from "@/lib/validations/contract-schemas";

/**
 * Props interface for the Pension Contracts Section component
 */
interface PensionContractsSectionProps {
  data: RentencheckData;
  contractManagement: UseContractManagementReturn;
  isConfirmed: boolean;
}

/**
 * Pension Contract Form Component - Extracted for proper memoization
 */
interface PensionFormProps {
  pensionForm: PensionContractData;
  setPensionForm: (form: PensionContractData) => void;
  state: UseContractManagementReturn["state"];
  handleSaveEditContract: () => void;
  handleAddPensionContract: () => void;
  handleCancelEdit: () => void;
  isConfirmed: boolean;
}

const PensionContractFormFields = React.memo(
  ({
    pensionForm,
    setPensionForm,
    state,
    handleSaveEditContract,
    handleAddPensionContract,
    handleCancelEdit,
    isConfirmed,
  }: PensionFormProps) => (
    <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-sm font-medium">Vertrag</Label>
          <Input
            value={pensionForm.contract}
            onChange={(e) => setPensionForm({ ...pensionForm, contract: e.target.value })}
            placeholder="Vertragsnummer/Name"
            className="h-9"
            disabled={isConfirmed}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-sm font-medium">Gesellschaft</Label>
          <Input
            value={pensionForm.company}
            onChange={(e) => setPensionForm({ ...pensionForm, company: e.target.value })}
            placeholder="Versicherungsgesellschaft"
            className="h-9"
            disabled={isConfirmed}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-sm font-medium">Vertragsart *</Label>
          <Select
            value={pensionForm.contractType}
            onValueChange={(value) => setPensionForm({ ...pensionForm, contractType: value })}
            disabled={isConfirmed}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Bitte wählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Basis-Rente">Basis-Rente</SelectItem>
              <SelectItem value="Riester-Rente">Riester-Rente</SelectItem>
              <SelectItem value="BAV-Rente">BAV-Rente</SelectItem>
              <SelectItem value="Mieteinnahme">Mieteinnahme</SelectItem>
              <SelectItem value="andere Art">andere Art</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-sm font-medium">Zinssatz bisher (%)</Label>
          <Input
            type="number"
            step="0.01"
            value={pensionForm.interestRate || ""}
            onChange={(e) =>
              setPensionForm({ ...pensionForm, interestRate: parseFloat(e.target.value) || 0 })
            }
            placeholder="0"
            className="h-9"
            disabled={isConfirmed}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label className="text-sm font-medium">Rente ab Jahr</Label>
          <Input
            type="number"
            value={pensionForm.pensionStartYear || ""}
            onChange={(e) =>
              setPensionForm({
                ...pensionForm,
                pensionStartYear: parseInt(e.target.value) || new Date().getFullYear(),
              })
            }
            placeholder="2025"
            className="h-9"
            disabled={isConfirmed}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-sm font-medium">Garantiert EURO</Label>
          <Input
            type="number"
            step="0.01"
            value={pensionForm.guaranteedAmount || ""}
            onChange={(e) =>
              setPensionForm({ ...pensionForm, guaranteedAmount: parseFloat(e.target.value) || 0 })
            }
            placeholder="0"
            className="h-9"
            disabled={isConfirmed}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-sm font-medium">Prognostiziert EURO</Label>
          <Input
            type="number"
            step="0.01"
            value={pensionForm.projectedAmount || ""}
            onChange={(e) =>
              setPensionForm({ ...pensionForm, projectedAmount: parseFloat(e.target.value) || 0 })
            }
            placeholder="0"
            className="h-9"
            disabled={isConfirmed}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3">
        <div className="space-y-1">
          <Label className="text-sm font-medium">Monatliche Rente EURO *</Label>
          <Input
            type="number"
            step="0.01"
            value={pensionForm.monthlyAmount || ""}
            onChange={(e) =>
              setPensionForm({ ...pensionForm, monthlyAmount: parseFloat(e.target.value) || 0 })
            }
            placeholder="0"
            className="h-9"
            disabled={isConfirmed}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={
            state.editingContract?.type === "pension"
              ? handleSaveEditContract
              : handleAddPensionContract
          }
          size="sm"
          className="flex items-center gap-1"
          disabled={
            !pensionForm.contract ||
            !pensionForm.contractType ||
            pensionForm.monthlyAmount <= 0 ||
            isConfirmed
          }
          aria-label={
            state.editingContract?.type === "pension"
              ? "Rentenvertrag speichern"
              : "Rentenvertrag hinzufügen"
          }
          tabIndex={0}
        >
          <Save className="h-3 w-3" />
          {state.editingContract?.type === "pension" ? "Speichern" : "Hinzufügen"}
        </Button>
        <Button
          onClick={handleCancelEdit}
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          disabled={isConfirmed}
          aria-label="Bearbeitung abbrechen"
          tabIndex={0}
        >
          <X className="h-3 w-3" />
          Abbrechen
        </Button>
      </div>
    </div>
  ),
);

PensionContractFormFields.displayName = "PensionContractFormFields";

/**
 * PensionContractsSection Component
 *
 * Handles pension contracts management with form and list display.
 * Follows single responsibility principle and uses contract management hook.
 */
export function PensionContractsSection({
  data,
  contractManagement,
  isConfirmed,
}: PensionContractsSectionProps) {
  const {
    state,
    pensionForm,
    setPensionForm,
    handleAddPensionContract,
    handleEditContract,
    handleSaveEditContract,
    handleRemoveContract,
    handleCancelEdit,
    handleShowPensionForm,
  } = contractManagement;

  const PensionContractList = () => (
    <div className="space-y-2">
      {data.pensionContracts.map((contract, index) => (
        <div
          key={index}
          className="bg-white border rounded-lg p-3 flex items-center justify-between"
        >
          <div className="flex-1">
            <div className="font-medium text-sm">
              {contract.contract} - {contract.contractType}
            </div>
            <div className="text-blue-600 font-semibold">
              {contract.monthlyAmount.toLocaleString("de-DE", { minimumFractionDigits: 2 })} € /
              Monat
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {contract.company} | Ab: {contract.pensionStartYear}
            </div>
          </div>
          {!isConfirmed && (
            <div className="flex gap-1">
              <Button
                onClick={() => handleEditContract("pension", index)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                onClick={() => handleRemoveContract("pension", index)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Verträge mit Renten bzw. laufendem Einkommen
        </h3>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          disabled={isConfirmed}
          onClick={handleShowPensionForm}
        >
          <Plus className="h-4 w-4" />
          Vertrag hinzufügen
        </Button>
      </div>

      {state.showPensionForm && (
        <PensionContractFormFields
          pensionForm={pensionForm}
          setPensionForm={setPensionForm}
          state={state}
          handleSaveEditContract={handleSaveEditContract}
          handleAddPensionContract={handleAddPensionContract}
          handleCancelEdit={handleCancelEdit}
          isConfirmed={isConfirmed}
        />
      )}

      {data.pensionContracts.length > 0 ? (
        <PensionContractList />
      ) : (
        <p className="text-gray-500 text-sm">Noch keine Verträge hinzugefügt</p>
      )}
    </div>
  );
}
