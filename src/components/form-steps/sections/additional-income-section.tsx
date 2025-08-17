"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Edit, Save, X } from "lucide-react"
import type { RentenblickData } from "../../rentenblick-form"

/**
 * Props interface for the Additional Income Section component
 */
interface AdditionalIncomeSectionProps {
    data: RentenblickData
    contractManagement: any
    isConfirmed: boolean
}

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
                    value={incomeForm.startYear || ""}
                    onChange={(e) => setIncomeForm({ ...incomeForm, startYear: parseInt(e.target.value) || new Date().getFullYear() })}
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

AdditionalIncomeFormFields.displayName = 'AdditionalIncomeFormFields'

/**
 * AdditionalIncomeSection Component
 * 
 * Handles additional income management with form and list display.
 * Follows single responsibility principle and uses contract management hook.
 */
export function AdditionalIncomeSection({ data, contractManagement, isConfirmed }: AdditionalIncomeSectionProps) {
    const {
        state,
        incomeForm,
        setIncomeForm,
        handleAddIncomeEntry,
        handleEditContract,
        handleSaveEditContract,
        handleRemoveContract,
        handleCancelEdit,
        handleShowIncomeForm
    } = contractManagement

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
                            Ab: {income.startYear}
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
            
            {state.showIncomeForm && (
                <AdditionalIncomeFormFields 
                    incomeForm={incomeForm} 
                    setIncomeForm={setIncomeForm} 
                    state={state} 
                    handleSaveEditContract={handleSaveEditContract} 
                    handleAddIncomeEntry={handleAddIncomeEntry} 
                    handleCancelEdit={handleCancelEdit} 
                    isConfirmed={isConfirmed} 
                />
            )}
            
            {data.additionalIncome.length > 0 ? (
                <AdditionalIncomeList />
            ) : (
                <p className="text-gray-500 text-sm">Noch keine zusätzlichen Einkünfte hinzugefügt</p>
            )}
        </div>
    )
} 