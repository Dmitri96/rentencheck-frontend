"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import type { RentenblickData } from "../rentenblick-form"

interface ContractOverviewStepProps {
    data: RentenblickData
    updateData: (data: Partial<RentenblickData>) => void
    isConfirmed: boolean
}

export function ContractOverviewStep({ data, updateData, isConfirmed }: ContractOverviewStepProps) {
    return (
        <div className={`space-y-8 ${isConfirmed ? "opacity-60 pointer-events-none" : ""}`}>
            <div className="space-y-6">
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
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Verträge mit Ablaufleistungen</h3>
                    <Button variant="outline" size="sm" className="flex items-center gap-2" disabled={isConfirmed}>
                        <Plus className="h-4 w-4" />
                        Vertrag hinzufügen
                    </Button>
                </div>
                {data.payoutContracts.length === 0 && <p className="text-gray-500 text-sm">Noch keine Verträge hinzugefügt</p>}
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Verträge mit Renten bzw. laufendem Einkommen</h3>
                    <Button variant="outline" size="sm" className="flex items-center gap-2" disabled={isConfirmed}>
                        <Plus className="h-4 w-4" />
                        Vertrag hinzufügen
                    </Button>
                </div>
                {data.pensionContracts.length === 0 && <p className="text-gray-500 text-sm">Noch keine Verträge hinzugefügt</p>}
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Erwarten Sie weitere Einkünfte, Einnahmen bzw. Vermögenswerte, die heute noch nicht vorliegen?
                    </h3>
                    <Button variant="outline" size="sm" className="flex items-center gap-2" disabled={isConfirmed}>
                        <Plus className="h-4 w-4" />
                        Einkunft hinzufügen
                    </Button>
                </div>
                {data.additionalIncome.length === 0 && (
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
