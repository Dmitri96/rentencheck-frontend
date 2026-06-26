"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RentencheckData } from "@/lib/services/rentencheck-service";

/**
 * Props interface for the Civil Service Provision Section component
 */
interface CivilServiceProvisionSectionProps {
  data: RentencheckData;
  updateData: (data: Partial<RentencheckData>) => void;
  isConfirmed: boolean;
}

/**
 * CivilServiceProvisionSection Component
 *
 * Handles civil service provision claims input with checkbox-controlled form fields.
 * Follows single responsibility principle and accessibility best practices.
 */
export function CivilServiceProvisionSection({
  data,
  updateData,
  isConfirmed,
}: CivilServiceProvisionSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <Checkbox
          id="civilServiceProvision"
          checked={data.civilServiceProvision}
          onCheckedChange={(checked) => updateData({ civilServiceProvision: checked as boolean })}
          disabled={isConfirmed}
        />
        <Label htmlFor="civilServiceProvision" className="text-sm font-medium cursor-pointer">
          Ansprüche aus Beamtenversorgung
        </Label>
      </div>

      {/* Show input fields when checkbox is checked */}
      {data.civilServiceProvision && (
        <div className="ml-7 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="border-l-2 border-border pl-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="civilServiceProvisionAge" className="text-sm">
                  Im Alter von
                </Label>
                <Input
                  id="civilServiceProvisionAge"
                  type="number"
                  value={data.civilServiceProvisionAge || ""}
                  onChange={(e) =>
                    updateData({ civilServiceProvisionAge: Number.parseInt(e.target.value) || 0 })
                  }
                  placeholder="0"
                  disabled={isConfirmed}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="civilServiceProvisionAmount" className="text-sm">
                  Wie viel
                </Label>
                <Input
                  id="civilServiceProvisionAmount"
                  type="number"
                  value={data.civilServiceProvisionAmount || ""}
                  onChange={(e) =>
                    updateData({
                      civilServiceProvisionAmount: Number.parseFloat(e.target.value) || 0,
                    })
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
