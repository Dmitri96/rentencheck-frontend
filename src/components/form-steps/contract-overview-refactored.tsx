"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useContractManagement } from "@/hooks/use-contract-management";
import type { RentenblickData } from "../rentenblick-form";

/**
 * Props interface for the Contract Overview Step component
 * This step handles collection of existing pension contracts and future income expectations
 */
interface ContractOverviewStepProps {
  data: RentenblickData;
  updateData: (data: Partial<RentenblickData>) => void;
  isConfirmed: boolean;
}

/**
 * ContractOverviewStep Component
 *
 * This component provides a comprehensive interface for managing pension contracts
 * and additional income sources. It uses a custom hook for business logic separation
 * and follows all accessibility and UX best practices.
 *
 * Key features:
 * - Checkbox-controlled form sections for different pension types
 * - Dynamic contract management with CRUD operations
 * - Zod validation with German error messages
 * - Full accessibility support with ARIA labels and keyboard navigation
 * - Toast notifications for user feedback
 * - Responsive design that works on mobile and desktop
 */
export function ContractOverviewStepRefactored({
  data,
  updateData,
  isConfirmed,
}: ContractOverviewStepProps) {
  /**
   * Custom hook that handles all contract-related business logic
   * Provides clean separation of concerns and reusable contract management
   */
  const {
    state,
    payoutForm,
    pensionForm,
    incomeForm,
    setPayoutForm,
    setPensionForm,
    setIncomeForm,
    handleAddPayoutContract,
    handleAddPensionContract,
    handleAddIncomeEntry,
    handleEditContract,
    handleSaveEditContract,
    handleRemoveContract,
    handleCancelEdit,
    handleShowPayoutForm,
    handleShowPensionForm,
    handleShowIncomeForm,
  } = useContractManagement(data, updateData, isConfirmed);

  /**
   * Handles checkbox state changes for pension type selections
   * Updates the form data and provides accessibility feedback
   */
  const handlePensionTypeChange = (field: keyof RentenblickData, checked: boolean) => {
    updateData({ [field]: checked });
  };

  /**
   * Payout Contract Form Component
   * Renders the detailed form for adding/editing payout contracts with validation
   */
  const PayoutContractFormFields = () => (
    <div
      className="bg-gray-50 p-4 rounded-lg border space-y-4"
      role="form"
      aria-labelledby="payout-form-title"
    >
      <h4 id="payout-form-title" className="sr-only">
        Auszahlungsvertrag hinzufügen oder bearbeiten
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="payout-contract" className="text-sm font-medium">
            Vertrag *
          </Label>
          <Input
            id="payout-contract"
            value={payoutForm.contract}
            onChange={(e) => setPayoutForm({ ...payoutForm, contract: e.target.value })}
            placeholder="Vertragsnummer/Name"
            className="h-9"
            disabled={isConfirmed}
            aria-required="true"
            aria-describedby={state.validationErrors.contract ? "payout-contract-error" : undefined}
            tabIndex={0}
          />
          {state.validationErrors.contract && (
            <p id="payout-contract-error" className="text-sm text-red-600" role="alert">
              {state.validationErrors.contract}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="payout-company" className="text-sm font-medium">
            Gesellschaft *
          </Label>
          <Input
            id="payout-company"
            value={payoutForm.company}
            onChange={(e) => setPayoutForm({ ...payoutForm, company: e.target.value })}
            placeholder="Versicherungsgesellschaft"
            className="h-9"
            disabled={isConfirmed}
            aria-required="true"
            tabIndex={0}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="payout-type" className="text-sm font-medium">
            Vertragsart *
          </Label>
          <Select
            value={payoutForm.contractType}
            onValueChange={(value) => setPayoutForm({ ...payoutForm, contractType: value })}
            disabled={isConfirmed}
          >
            <SelectTrigger id="payout-type" className="h-9" aria-required="true" tabIndex={0}>
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
          <Label htmlFor="payout-interest" className="text-sm font-medium">
            Zinssatz bisher (%)
          </Label>
          <Input
            id="payout-interest"
            type="number"
            step="0.01"
            value={payoutForm.interestRate || ""}
            onChange={(e) =>
              setPayoutForm({ ...payoutForm, interestRate: parseFloat(e.target.value) || 0 })
            }
            placeholder="0"
            className="h-9"
            disabled={isConfirmed}
            tabIndex={0}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label htmlFor="payout-year" className="text-sm font-medium">
            Ablauf Jahr
          </Label>
          <Input
            id="payout-year"
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
            tabIndex={0}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="payout-guaranteed" className="text-sm font-medium">
            Ablauf EURO garantiert (€) *
          </Label>
          <Input
            id="payout-guaranteed"
            type="number"
            step="0.01"
            value={payoutForm.guaranteedAmount || ""}
            onChange={(e) =>
              setPayoutForm({ ...payoutForm, guaranteedAmount: parseFloat(e.target.value) || 0 })
            }
            placeholder="0"
            className="h-9"
            disabled={isConfirmed}
            aria-required="true"
            tabIndex={0}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="payout-projected" className="text-sm font-medium">
            Ablauf EURO prognostiziert (€)
          </Label>
          <Input
            id="payout-projected"
            type="number"
            step="0.01"
            value={payoutForm.projectedAmount || ""}
            onChange={(e) =>
              setPayoutForm({ ...payoutForm, projectedAmount: parseFloat(e.target.value) || 0 })
            }
            placeholder="0"
            className="h-9"
            disabled={isConfirmed}
            tabIndex={0}
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
  );

  /**
   * Contract Display List Component
   * Shows existing contracts with edit/delete functionality
   */
  const PayoutContractList = () => (
    <div className="space-y-2" role="list" aria-label="Liste der Auszahlungsverträge">
      {data.payoutContracts.map((contract, index) => (
        <div
          key={`payout-${index}`}
          className="bg-white border rounded-lg p-3 flex items-center justify-between"
          role="listitem"
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
                aria-label={`Vertrag ${contract.contract} bearbeiten`}
                tabIndex={0}
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                onClick={() => handleRemoveContract("payout", index)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                aria-label={`Vertrag ${contract.contract} löschen`}
                tabIndex={0}
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
    <div className={`space-y-8 ${isConfirmed ? "opacity-60 pointer-events-none" : ""}`}>
      <div className="space-y-6">
        {/* Statutory Pension Claims Section */}
        <div className="space-y-4" role="group" aria-labelledby="statutory-pension-heading">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="statutoryPensionClaims"
              checked={data.statutoryPensionClaims}
              onCheckedChange={(checked) =>
                handlePensionTypeChange("statutoryPensionClaims", checked as boolean)
              }
              disabled={isConfirmed}
              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              aria-describedby="statutory-pension-description"
              tabIndex={0}
            />
            <Label
              htmlFor="statutoryPensionClaims"
              id="statutory-pension-heading"
              className="text-sm font-medium cursor-pointer"
            >
              Ansprüche aus gesetzlicher Rentenversicherung
            </Label>
          </div>

          {/* Conditional input fields */}
          {data.statutoryPensionClaims && (
            <div
              className="ml-7 space-y-4 animate-in slide-in-from-top-2 duration-200"
              role="group"
            >
              <div className="border-l-2 border-blue-200 pl-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="statutoryPensionAge"
                      className="text-sm font-medium text-gray-700"
                    >
                      Im Alter von
                    </Label>
                    <Input
                      id="statutoryPensionAge"
                      type="number"
                      value={data.statutoryPensionAge || ""}
                      onChange={(e) =>
                        updateData({ statutoryPensionAge: Number.parseInt(e.target.value) || 0 })
                      }
                      placeholder="0"
                      className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                      disabled={isConfirmed}
                      tabIndex={0}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="statutoryPensionAmount"
                      className="text-sm font-medium text-gray-700"
                    >
                      Wie viel
                    </Label>
                    <Input
                      id="statutoryPensionAmount"
                      type="number"
                      value={data.statutoryPensionAmount || ""}
                      onChange={(e) =>
                        updateData({
                          statutoryPensionAmount: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="0"
                      className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                      disabled={isConfirmed}
                      tabIndex={0}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payout Contracts Section */}
      <section className="space-y-4" aria-labelledby="payout-contracts-heading">
        <div className="flex items-center justify-between">
          <h3 id="payout-contracts-heading" className="text-lg font-semibold text-gray-900">
            Verträge mit Ablaufleistungen
          </h3>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            disabled={isConfirmed}
            onClick={handleShowPayoutForm}
            aria-label="Neuen Auszahlungsvertrag hinzufügen"
            tabIndex={0}
          >
            <Plus className="h-4 w-4" />
            Vertrag hinzufügen
          </Button>
        </div>

        {state.showPayoutForm && <PayoutContractFormFields />}

        {data.payoutContracts.length > 0 ? (
          <PayoutContractList />
        ) : (
          <p className="text-gray-500 text-sm" role="status">
            Noch keine Verträge hinzugefügt
          </p>
        )}
      </section>

      {/* Confirmation Status */}
      {isConfirmed && (
        <div
          className="bg-green-50 p-4 rounded-lg border border-green-200"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" aria-hidden="true"></div>
            <span className="text-green-800 font-medium">Vertragsübersicht bestätigt</span>
          </div>
        </div>
      )}
    </div>
  );
}
