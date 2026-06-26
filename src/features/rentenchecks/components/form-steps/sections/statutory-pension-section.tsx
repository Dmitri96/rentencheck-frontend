"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RentencheckData } from "@/lib/services/rentencheck-service";

/**
 * Props interface for the Statutory Pension Section component
 */
interface StatutoryPensionSectionProps {
  data: RentencheckData;
  updateData: (data: Partial<RentencheckData>) => void;
  isConfirmed: boolean;
}

/**
 * StatutoryPensionSection Component
 *
 * Handles statutory pension claims input with checkbox-controlled form fields.
 * Follows single responsibility principle and accessibility best practices.
 */
export function StatutoryPensionSection({
  data,
  updateData,
  isConfirmed,
}: StatutoryPensionSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <Checkbox
          id="statutoryPensionClaims"
          checked={data.statutoryPensionClaims}
          onCheckedChange={(checked) => updateData({ statutoryPensionClaims: checked as boolean })}
          disabled={isConfirmed}
        />
        <Label htmlFor="statutoryPensionClaims" className="text-sm font-medium cursor-pointer">
          Ansprüche aus gesetzlicher Rentenversicherung dasds
        </Label>
      </div>

      {/* Show input fields when checkbox is checked */}
      {data.statutoryPensionClaims && (
        <div className="ml-7 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="border-l-2 border-border pl-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="statutoryPensionAge" className="text-sm">
                  Im Alter von
                </Label>
                <Input
                  id="statutoryPensionAge"
                  type="number"
                  value={data.statutoryPensionAge || ""}
                  onChange={(e) =>
                    updateData({
                      statutoryPensionAge: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                  disabled={isConfirmed}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="statutoryPensionAmount" className="text-sm">
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
                  disabled={isConfirmed}
                />
              </div>
            </div>

            {/* Erwerbsminderungsrente amount (no age) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="disabilityPensionAmount" className="text-sm">
                  Ansprüche aus Erwerbsminderungsrente (mtl.)
                </Label>
                <Input
                  id="disabilityPensionAmount"
                  type="number"
                  value={
                    (data as RentencheckData & { disabilityPensionAmount?: number })
                      .disabilityPensionAmount || ""
                  }
                  onChange={(e) =>
                    updateData({
                      // disabilityPensionAmount extends the base form model for forward compatibility
                      disabilityPensionAmount: Number.parseFloat(e.target.value) || 0,
                    } as Partial<RentencheckData>)
                  }
                  placeholder="0"
                  disabled={isConfirmed}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
