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
import type { PayoutContractData } from "@/lib/validations/contract-schemas";

/**
 * Props interface for the Payout Contracts Section component
 */
interface PayoutContractsSectionProps {
  data: RentencheckData;
  contractManagement: UseContractManagementReturn;
  isConfirmed: boolean;
}

/**
 * Payout Contract Form Component - Extracted for proper memoization
 */
interface PayoutFormProps {
  payoutForm: PayoutContractData;
  setPayoutForm: (form: PayoutContractData) => void;
  state: UseContractManagementReturn["state"];
  handleSaveEditContract: () => void;
  handleAddPayoutContract: () => void;
  handleCancelEdit: () => void;
  isConfirmed: boolean;
}

const PayoutContractFormFields = React.memo(
  ({
    payoutForm,
    setPayoutForm,
    state,
    handleSaveEditContract,
    handleAddPayoutContract,
    handleCancelEdit,
    isConfirmed,
  }: PayoutFormProps) => (
    <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-sm font-medium">Vertrag</Label>
          <Input
            value={payoutForm.contract}
            onChange={(e) => setPayoutForm({ ...payoutForm, contract: e.target.value })}
            placeholder="Vertragsnummer/Name"
            className="h-9"
            disabled={isConfirmed}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-sm font-medium">Gesellschaft</Label>
          <Input
            value={payoutForm.company}
            onChange={(e) => setPayoutForm({ ...payoutForm, company: e.target.value })}
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
            value={payoutForm.contractType}
            onValueChange={(value) => setPayoutForm({ ...payoutForm, contractType: value })}
            disabled={isConfirmed}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Bitte wählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Kapital-Lebensvers.">Kapital-Lebensvers.</SelectItem>
              <SelectItem value="Rentenvers.">Rentenvers.</SelectItem>
              <SelectItem value="Direktvers.">Direktvers.</SelectItem>
              <SelectItem value="Investment">Investment</SelectItem>
              <SelectItem value="andere Art">andere Art</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-sm font-medium">Zinssatz bisher (%)</Label>
          <Input
            type="number"
            step="0.01"
            value={payoutForm.interestRate || ""}
            onChange={(e) =>
              setPayoutForm({ ...payoutForm, interestRate: parseFloat(e.target.value) || 0 })
            }
            placeholder="0"
            className="h-9"
            disabled={isConfirmed}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label className="text-sm font-medium">Ablauf Jahr</Label>
          <Input
            type="number"
            value={payoutForm.maturityYear || ""}
            onChange={(e) =>
              setPayoutForm({
                ...payoutForm,
                maturityYear: parseInt(e.target.value) || new Date().getFullYear(),
              })
            }
            placeholder="2025"
            className="h-9"
            disabled={isConfirmed}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-sm font-medium">Ablauf EURO garantiert (€) *</Label>
          <Input
            type="number"
            step="0.01"
            value={payoutForm.guaranteedAmount || ""}
            onChange={(e) =>
              setPayoutForm({ ...payoutForm, guaranteedAmount: parseFloat(e.target.value) || 0 })
            }
            placeholder="0"
            className="h-9"
            disabled={isConfirmed}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-sm font-medium">Ablauf EURO prognostiziert (€)</Label>
          <Input
            type="number"
            step="0.01"
            value={payoutForm.projectedAmount || ""}
            onChange={(e) =>
              setPayoutForm({ ...payoutForm, projectedAmount: parseFloat(e.target.value) || 0 })
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
            state.editingContract?.type === "payout"
              ? handleSaveEditContract
              : handleAddPayoutContract
          }
          size="sm"
          className="flex items-center gap-1"
          disabled={
            !payoutForm.contract ||
            !payoutForm.contractType ||
            payoutForm.guaranteedAmount <= 0 ||
            isConfirmed
          }
          aria-label={
            state.editingContract?.type === "payout"
              ? "Auszahlungsvertrag speichern"
              : "Auszahlungsvertrag hinzufügen"
          }
          tabIndex={0}
        >
          <Save className="h-3 w-3" />
          {state.editingContract?.type === "payout" ? "Speichern" : "Hinzufügen"}
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

PayoutContractFormFields.displayName = "PayoutContractFormFields";

/**
 * PayoutContractsSection Component
 *
 * Handles payout contracts management with form and list display.
 * Follows single responsibility principle and uses contract management hook.
 */
export function PayoutContractsSection({
  data,
  contractManagement,
  isConfirmed,
}: PayoutContractsSectionProps) {
  const {
    state,
    payoutForm,
    setPayoutForm,
    handleAddPayoutContract,
    handleEditContract,
    handleSaveEditContract,
    handleRemoveContract,
    handleCancelEdit,
    handleShowPayoutForm,
  } = contractManagement;

  const PayoutContractList = () => (
    <div className="space-y-2">
      {data.payoutContracts.map((contract, index) => (
        <div
          key={index}
          className="bg-white border rounded-lg p-3 flex items-center justify-between"
        >
          <div className="flex-1">
            <div className="font-medium text-sm">
              {contract.contract} - {contract.contractType}
            </div>
            <div className="text-blue-600 font-semibold">
              Garantiert:{" "}
              {contract.guaranteedAmount.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
            </div>
            {contract.projectedAmount > 0 && (
              <div className="text-green-600 text-sm">
                Prognostiziert:{" "}
                {contract.projectedAmount.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
              </div>
            )}
            <div className="text-xs text-gray-500 mt-1">
              {contract.company} | Ablauf: {contract.maturityYear}
            </div>
          </div>
          {!isConfirmed && (
            <div className="flex gap-1">
              <Button
                onClick={() => handleEditContract("payout", index)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                onClick={() => handleRemoveContract("payout", index)}
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
        <h3 className="text-lg font-semibold text-gray-900">Verträge mit Ablaufleistungen</h3>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          disabled={isConfirmed}
          onClick={handleShowPayoutForm}
        >
          <Plus className="h-4 w-4" />
          Vertrag hinzufügen
        </Button>
      </div>

      {state.showPayoutForm && (
        <PayoutContractFormFields
          payoutForm={payoutForm}
          setPayoutForm={setPayoutForm}
          state={state}
          handleSaveEditContract={handleSaveEditContract}
          handleAddPayoutContract={handleAddPayoutContract}
          handleCancelEdit={handleCancelEdit}
          isConfirmed={isConfirmed}
        />
      )}

      {data.payoutContracts.length > 0 ? (
        <PayoutContractList />
      ) : (
        <p className="text-gray-500 text-sm">Noch keine Verträge hinzugefügt</p>
      )}
    </div>
  );
}
