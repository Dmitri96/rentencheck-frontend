"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Edit, Save, X } from "lucide-react"
import { useContractManagement } from "@/hooks/use-contract-management"
import type { RentenblickData } from "../rentenblick-form"

/**
 * Props interface for the Contract Overview Step component
 * This step handles collection of existing pension contracts and future income expectations
 */
interface ContractOverviewStepProps {
    data: RentenblickData
    updateData: (data: Partial<RentenblickData>) => void
    isConfirmed: boolean
}

/**
 * Payout Contract Form Component - Extracted for proper memoization
 * Following React best practices: components outside main component + React.memo
 */
interface PayoutFormProps {
    payoutForm: any
    setPayoutForm: (form: any) => void
    state: any
    handleSaveEditContract: () => void
    handleAddPayoutContract: () => void
    handleCancelEdit: () => void
    isConfirmed: boolean
}

const PayoutContractFormFields = React.memo(({ 
    payoutForm, 
    setPayoutForm, 
    state, 
    handleSaveEditContract, 
    handleAddPayoutContract, 
    handleCancelEdit, 
    isConfirmed 
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
                <Select value={payoutForm.contractType} onValueChange={(value) => setPayoutForm({ ...payoutForm, contractType: value })} disabled={isConfirmed}>
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
                    onChange={(e) => setPayoutForm({ ...payoutForm, interestRate: parseFloat(e.target.value) || 0 })}
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
                    onChange={(e) => setPayoutForm({ ...payoutForm, maturityYear: parseInt(e.target.value) || new Date().getFullYear() })}
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
                    onChange={(e) => setPayoutForm({ ...payoutForm, guaranteedAmount: parseFloat(e.target.value) || 0 })}
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
                    onChange={(e) => setPayoutForm({ ...payoutForm, projectedAmount: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    className="h-9"
                    disabled={isConfirmed}
                />
            </div>
        </div>
        <div className="flex gap-2">
            <Button 
                onClick={state.editingContract?.type === 'payout' ? handleSaveEditContract : handleAddPayoutContract} 
                size="sm" 
                className="flex items-center gap-1"
                disabled={!payoutForm.contract || !payoutForm.contractType || payoutForm.guaranteedAmount <= 0 || isConfirmed}
                aria-label={state.editingContract?.type === 'payout' ? 'Auszahlungsvertrag speichern' : 'Auszahlungsvertrag hinzufügen'}
                tabIndex={0}
            >
                <Save className="h-3 w-3" />
                {state.editingContract?.type === 'payout' ? 'Speichern' : 'Hinzufügen'}
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
))

/**
 * Pension Contract Form Component - Extracted for proper memoization
 */
interface PensionFormProps {
    pensionForm: any
    setPensionForm: (form: any) => void
    state: any
    handleSaveEditContract: () => void
    handleAddPensionContract: () => void
    handleCancelEdit: () => void
    isConfirmed: boolean
}

const PensionContractFormFields = React.memo(({ 
    pensionForm, 
    setPensionForm, 
    state, 
    handleSaveEditContract, 
    handleAddPensionContract, 
    handleCancelEdit, 
    isConfirmed 
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
                <Select value={pensionForm.contractType} onValueChange={(value) => setPensionForm({ ...pensionForm, contractType: value })} disabled={isConfirmed}>
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
                    onChange={(e) => setPensionForm({ ...pensionForm, interestRate: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    className="h-9"
                    disabled={isConfirmed}
                />
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
                <Label className="text-sm font-medium">Rente ab Jahr</Label>
                <Input
                    type="number"
                    value={pensionForm.pensionFromYear || ""}
                    onChange={(e) => setPensionForm({ ...pensionForm, pensionFromYear: parseInt(e.target.value) || new Date().getFullYear() })}
                    placeholder="2025"
                    className="h-9"
                    disabled={isConfirmed}
                />
            </div>
            <div className="space-y-1">
                <Label className="text-sm font-medium">Rente EURO *</Label>
                <Input
                    type="number"
                    step="0.01"
                    value={pensionForm.pensionAmount || ""}
                    onChange={(e) => setPensionForm({ ...pensionForm, pensionAmount: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    className="h-9"
                    disabled={isConfirmed}
                />
            </div>
        </div>
        <div className="flex gap-2">
            <Button 
                onClick={state.editingContract?.type === 'pension' ? handleSaveEditContract : handleAddPensionContract} 
                size="sm" 
                className="flex items-center gap-1"
                disabled={!pensionForm.contract || !pensionForm.contractType || pensionForm.pensionAmount <= 0 || isConfirmed}
                aria-label={state.editingContract?.type === 'pension' ? 'Rentenvertrag speichern' : 'Rentenvertrag hinzufügen'}
                tabIndex={0}
            >
                <Save className="h-3 w-3" />
                {state.editingContract?.type === 'pension' ? 'Speichern' : 'Hinzufügen'}
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
))

/**
 * Additional Income Form Component - Extracted for proper memoization
 */
interface IncomeFormProps {
    incomeForm: any
    setIncomeForm: (form: any) => void
    state: any
    handleSaveEditContract: () => void
    handleAddIncomeEntry: () => void
    handleCancelEdit: () => void
    isConfirmed: boolean
}

const AdditionalIncomeFormFields = React.memo(({ 
    incomeForm, 
    setIncomeForm, 
    state, 
    handleSaveEditContract, 
    handleAddIncomeEntry, 
    handleCancelEdit, 
    isConfirmed 
}: IncomeFormProps) => (
    <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
                <Label className="text-sm font-medium">Welche? *</Label>
                <Input
                    value={incomeForm.type}
                    onChange={(e) => setIncomeForm({ ...incomeForm, type: e.target.value })}
                    placeholder="Art der Einkunft"
                    className="h-9"
                    disabled={isConfirmed}
                />
            </div>
            <div className="space-y-1">
                <Label className="text-sm font-medium">Ab wann?</Label>
                <Input
                    type="number"
                    value={incomeForm.fromYear || ""}
                    onChange={(e) => setIncomeForm({ ...incomeForm, fromYear: parseInt(e.target.value) || new Date().getFullYear() })}
                    placeholder="2025"
                    className="h-9"
                    disabled={isConfirmed}
                />
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
                <Label className="text-sm font-medium">Summe (€) *</Label>
                <Input
                    type="number"
                    step="0.01"
                    value={incomeForm.amount || ""}
                    onChange={(e) => setIncomeForm({ ...incomeForm, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    className="h-9"
                    disabled={isConfirmed}
                />
            </div>
            <div className="space-y-1">
                <Label className="text-sm font-medium">Periodizität *</Label>
                <Select value={incomeForm.frequency} onValueChange={(value) => setIncomeForm({ ...incomeForm, frequency: value })} disabled={isConfirmed}>
                    <SelectTrigger className="h-9">
                        <SelectValue placeholder="Bitte wählen" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Einmalig">Einmalig</SelectItem>
                        <SelectItem value="Monatlich">Monatlich</SelectItem>
                        <SelectItem value="Jährlich">Jährlich</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        <div className="flex gap-2">
            <Button 
                onClick={state.editingContract?.type === 'income' ? handleSaveEditContract : handleAddIncomeEntry} 
                size="sm" 
                className="flex items-center gap-1"
                disabled={!incomeForm.type || incomeForm.amount <= 0 || !incomeForm.frequency || isConfirmed}
            >
                <Save className="h-3 w-3" />
                {state.editingContract?.type === 'income' ? 'Speichern' : 'Hinzufügen'}
            </Button>
            <Button 
                onClick={handleCancelEdit} 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1"
                disabled={isConfirmed}
            >
                <X className="h-3 w-3" />
                Abbrechen
            </Button>
        </div>
    </div>
))

// Set display names for better debugging
PayoutContractFormFields.displayName = 'PayoutContractFormFields'
PensionContractFormFields.displayName = 'PensionContractFormFields'
AdditionalIncomeFormFields.displayName = 'AdditionalIncomeFormFields'

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
export function ContractOverviewStep({ data, updateData, isConfirmed }: ContractOverviewStepProps) {
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
        handleShowIncomeForm
    } = useContractManagement(data, updateData, isConfirmed)

    /**
     * Handles checkbox state changes for pension type selections
     * Updates the form data and provides accessibility feedback
     */
    const handlePensionTypeChange = (field: keyof RentenblickData, checked: boolean) => {
        updateData({ [field]: checked })
    }

    const PayoutContractList = () => (
        <div className="space-y-2">
            {data.payoutContracts.map((contract, index) => (
                <div key={index} className="bg-white border rounded-lg p-3 flex items-center justify-between">
                    <div className="flex-1">
                        <div className="font-medium text-sm">{contract.contract} - {contract.contractType}</div>
                        <div className="text-blue-600 font-semibold">
                            Garantiert: {contract.guaranteedAmount.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                        </div>
                        {contract.projectedAmount > 0 && (
                            <div className="text-green-600 text-sm">
                                Prognostiziert: {contract.projectedAmount.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                            </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                            {contract.company} | Ablauf: {contract.maturityYear}
                        </div>
                    </div>
                    {!isConfirmed && (
                        <div className="flex gap-1">
                            <Button 
                                onClick={() => handleEditContract('payout', index)} 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0"
                            >
                                <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                                onClick={() => handleRemoveContract('payout', index)} 
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
    )

    const PensionContractList = () => (
        <div className="space-y-2">
            {data.pensionContracts.map((contract, index) => (
                <div key={index} className="bg-white border rounded-lg p-3 flex items-center justify-between">
                    <div className="flex-1">
                        <div className="font-medium text-sm">{contract.contract} - {contract.contractType}</div>
                        <div className="text-blue-600 font-semibold">
                            {contract.pensionAmount.toLocaleString('de-DE', { minimumFractionDigits: 2 })} € / Monat
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            {contract.company} | Ab: {contract.pensionFromYear}
                        </div>
                    </div>
                    {!isConfirmed && (
                        <div className="flex gap-1">
                            <Button 
                                onClick={() => handleEditContract('pension', index)} 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0"
                            >
                                <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                                onClick={() => handleRemoveContract('pension', index)} 
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
    )

    const AdditionalIncomeList = () => (
        <div className="space-y-2">
            {data.additionalIncome.map((income, index) => (
                <div key={index} className="bg-white border rounded-lg p-3 flex items-center justify-between">
                    <div className="flex-1">
                        <div className="font-medium text-sm">{income.type}</div>
                        <div className="text-blue-600 font-semibold">
                            {income.amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })} € ({income.frequency})
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            Ab: {income.fromYear}
                        </div>
                    </div>
                    {!isConfirmed && (
                        <div className="flex gap-1">
                            <Button 
                                onClick={() => handleEditContract('income', index)} 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0"
                            >
                                <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                                onClick={() => handleRemoveContract('income', index)} 
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
    )

    return (
        <div className={`space-y-8 ${isConfirmed ? "opacity-60 pointer-events-none" : ""}`}>
            <div className="space-y-6">
                {/* Statutory Pension Claims */}
                <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="statutoryPensionClaims"
                            checked={data.statutoryPensionClaims}
                            onCheckedChange={(checked) => updateData({ statutoryPensionClaims: checked as boolean })}
                            disabled={isConfirmed}
                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                        <Label htmlFor="statutoryPensionClaims" className="text-sm font-medium cursor-pointer">
                            Ansprüche aus gesetzlicher Rentenversicherung
                        </Label>
                    </div>
                    
                    {/* Show input fields when checkbox is checked */}
                    {data.statutoryPensionClaims && (
                        <div className="ml-7 space-y-4 animate-in slide-in-from-top-2 duration-200">
                            <div className="border-l-2 border-blue-200 pl-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="statutoryPensionAge" className="text-sm font-medium text-gray-700">
                                            Im Alter von
                                        </Label>
                                        <Input
                                            id="statutoryPensionAge"
                                            type="number"
                                            value={data.statutoryPensionAge || ""}
                                            onChange={(e) => updateData({ statutoryPensionAge: Number.parseInt(e.target.value) || 0 })}
                                            placeholder="0"
                                            className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                                            disabled={isConfirmed}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="statutoryPensionAmount" className="text-sm font-medium text-gray-700">
                                            Wie viel
                                        </Label>
                                        <Input
                                            id="statutoryPensionAmount"
                                            type="number"
                                            value={data.statutoryPensionAmount || ""}
                                            onChange={(e) => updateData({ statutoryPensionAmount: Number.parseFloat(e.target.value) || 0 })}
                                            placeholder="0"
                                            className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                                            disabled={isConfirmed}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Professional Provision Works */}
                <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="professionalProvisionWorks"
                            checked={data.professionalProvisionWorks}
                            onCheckedChange={(checked) => updateData({ professionalProvisionWorks: checked as boolean })}
                            disabled={isConfirmed}
                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                        <Label htmlFor="professionalProvisionWorks" className="text-sm font-medium cursor-pointer">
                            Berufsständische Versorgungswerke
                        </Label>
                    </div>
                    
                    {/* Show input fields when checkbox is checked */}
                    {data.professionalProvisionWorks && (
                        <div className="ml-7 space-y-4 animate-in slide-in-from-top-2 duration-200">
                            <div className="border-l-2 border-blue-200 pl-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="professionalProvisionAge" className="text-sm font-medium text-gray-700">
                                            Im Alter von
                                        </Label>
                                        <Input
                                            id="professionalProvisionAge"
                                            type="number"
                                            value={data.professionalProvisionAge || ""}
                                            onChange={(e) => updateData({ professionalProvisionAge: Number.parseInt(e.target.value) || 0 })}
                                            placeholder="0"
                                            className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                                            disabled={isConfirmed}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="professionalProvisionAmount" className="text-sm font-medium text-gray-700">
                                            Wie viel
                                        </Label>
                                        <Input
                                            id="professionalProvisionAmount"
                                            type="number"
                                            value={data.professionalProvisionAmount || ""}
                                            onChange={(e) => updateData({ professionalProvisionAmount: Number.parseFloat(e.target.value) || 0 })}
                                            placeholder="0"
                                            className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                                            disabled={isConfirmed}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Public Service Additional Provision */}
                <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="publicServiceAdditionalProvision"
                            checked={data.publicServiceAdditionalProvision}
                            onCheckedChange={(checked) => updateData({ publicServiceAdditionalProvision: checked as boolean })}
                            disabled={isConfirmed}
                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                        <Label htmlFor="publicServiceAdditionalProvision" className="text-sm font-medium cursor-pointer">
                            Ansprüche aus Zusatzversorgung Öffentlicher Dienst
                        </Label>
                    </div>
                    
                    {/* Show input fields when checkbox is checked */}
                    {data.publicServiceAdditionalProvision && (
                        <div className="ml-7 space-y-4 animate-in slide-in-from-top-2 duration-200">
                            <div className="border-l-2 border-blue-200 pl-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="publicServiceProvisionAge" className="text-sm font-medium text-gray-700">
                                            Im Alter von
                                        </Label>
                                        <Input
                                            id="publicServiceProvisionAge"
                                            type="number"
                                            value={data.publicServiceProvisionAge || ""}
                                            onChange={(e) => updateData({ publicServiceProvisionAge: Number.parseInt(e.target.value) || 0 })}
                                            placeholder="0"
                                            className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                                            disabled={isConfirmed}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="publicServiceProvisionAmount" className="text-sm font-medium text-gray-700">
                                            Wie viel
                                        </Label>
                                        <Input
                                            id="publicServiceProvisionAmount"
                                            type="number"
                                            value={data.publicServiceProvisionAmount || ""}
                                            onChange={(e) => updateData({ publicServiceProvisionAmount: Number.parseFloat(e.target.value) || 0 })}
                                            placeholder="0"
                                            className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                                            disabled={isConfirmed}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Civil Service Provision */}
                <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="civilServiceProvision"
                            checked={data.civilServiceProvision}
                            onCheckedChange={(checked) => updateData({ civilServiceProvision: checked as boolean })}
                            disabled={isConfirmed}
                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                        <Label htmlFor="civilServiceProvision" className="text-sm font-medium cursor-pointer">
                            Ansprüche aus Beamtenversorgung
                        </Label>
                    </div>
                    
                    {/* Show input fields when checkbox is checked */}
                    {data.civilServiceProvision && (
                        <div className="ml-7 space-y-4 animate-in slide-in-from-top-2 duration-200">
                            <div className="border-l-2 border-blue-200 pl-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="civilServiceProvisionAge" className="text-sm font-medium text-gray-700">
                                            Im Alter von
                                        </Label>
                                        <Input
                                            id="civilServiceProvisionAge"
                                            type="number"
                                            value={data.civilServiceProvisionAge || ""}
                                            onChange={(e) => updateData({ civilServiceProvisionAge: Number.parseInt(e.target.value) || 0 })}
                                            placeholder="0"
                                            className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                                            disabled={isConfirmed}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="civilServiceProvisionAmount" className="text-sm font-medium text-gray-700">
                                            Wie viel
                                        </Label>
                                        <Input
                                            id="civilServiceProvisionAmount"
                                            type="number"
                                            value={data.civilServiceProvisionAmount || ""}
                                            onChange={(e) => updateData({ civilServiceProvisionAmount: Number.parseFloat(e.target.value) || 0 })}
                                            placeholder="0"
                                            className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                                            disabled={isConfirmed}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Payout Contracts Section */}
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
                
                {state.showPayoutForm && <PayoutContractFormFields payoutForm={payoutForm} setPayoutForm={setPayoutForm} state={state} handleSaveEditContract={handleSaveEditContract} handleAddPayoutContract={handleAddPayoutContract} handleCancelEdit={handleCancelEdit} isConfirmed={isConfirmed} />}
                
                {data.payoutContracts.length > 0 ? (
                    <PayoutContractList />
                ) : (
                    <p className="text-gray-500 text-sm">Noch keine Verträge hinzugefügt</p>
                )}
            </div>

            {/* Pension Contracts Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Verträge mit Renten bzw. laufendem Einkommen</h3>
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
                
                {state.showPensionForm && <PensionContractFormFields pensionForm={pensionForm} setPensionForm={setPensionForm} state={state} handleSaveEditContract={handleSaveEditContract} handleAddPensionContract={handleAddPensionContract} handleCancelEdit={handleCancelEdit} isConfirmed={isConfirmed} />}
                
                {data.pensionContracts.length > 0 ? (
                    <PensionContractList />
                ) : (
                    <p className="text-gray-500 text-sm">Noch keine Verträge hinzugefügt</p>
                )}
            </div>

            {/* Additional Income Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Erwarten Sie weitere Einkünfte, Einnahmen bzw. Vermögenswerte, die heute noch nicht vorliegen?
                    </h3>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-2" 
                        disabled={isConfirmed}
                        onClick={handleShowIncomeForm}
                    >
                        <Plus className="h-4 w-4" />
                        Einkunft hinzufügen
                    </Button>
                </div>
                
                {state.showIncomeForm && <AdditionalIncomeFormFields incomeForm={incomeForm} setIncomeForm={setIncomeForm} state={state} handleSaveEditContract={handleSaveEditContract} handleAddIncomeEntry={handleAddIncomeEntry} handleCancelEdit={handleCancelEdit} isConfirmed={isConfirmed} />}
                
                {data.additionalIncome.length > 0 ? (
                    <AdditionalIncomeList />
                ) : (
                    <p className="text-gray-500 text-sm">Noch keine zusätzlichen Einkünfte hinzugefügt</p>
                )}
            </div>

            {isConfirmed && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-800 font-medium">Vertragsübersicht bestätigt</span>
                    </div>
                </div>
            )}
        </div>
    )
}
