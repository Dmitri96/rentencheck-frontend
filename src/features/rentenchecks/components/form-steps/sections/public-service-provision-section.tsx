"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RentencheckData } from "@/lib/services/rentencheck-service";

/**
 * Props interface for the Public Service Provision Section component
 */
interface PublicServiceProvisionSectionProps {
  data: RentencheckData;
  updateData: (data: Partial<RentencheckData>) => void;
  isConfirmed: boolean;
}

/**
 * PublicServiceProvisionSection Component
 *
 * Handles public service additional provision claims input with checkbox-controlled form fields.
 * Follows single responsibility principle and accessibility best practices.
 */
export function PublicServiceProvisionSection({
  data,
  updateData,
  isConfirmed,
}: PublicServiceProvisionSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <Checkbox
          id="publicServiceAdditionalProvision"
          checked={data.publicServiceAdditionalProvision}
          onCheckedChange={(checked) =>
            updateData({ publicServiceAdditionalProvision: checked as boolean })
          }
          disabled={isConfirmed}
        />
        <Label
          htmlFor="publicServiceAdditionalProvision"
          className="text-sm font-medium cursor-pointer"
        >
          Ansprüche aus Zusatzversorgung Öffentlicher Dienst
        </Label>
      </div>

      {/* Show input fields when checkbox is checked */}
      {data.publicServiceAdditionalProvision && (
        <div className="ml-7 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="border-l-2 border-border pl-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="publicServiceProvisionAge" className="text-sm">
                  Im Alter von
                </Label>
                <Input
                  id="publicServiceProvisionAge"
                  type="number"
                  value={data.publicServiceProvisionAge || ""}
                  onChange={(e) =>
                    updateData({ publicServiceProvisionAge: Number.parseInt(e.target.value) || 0 })
                  }
                  placeholder="0"
                  disabled={isConfirmed}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="publicServiceProvisionAmount" className="text-sm">
                  Wie viel
                </Label>
                <Input
                  id="publicServiceProvisionAmount"
                  type="number"
                  value={data.publicServiceProvisionAmount || ""}
                  onChange={(e) =>
                    updateData({
                      publicServiceProvisionAmount: Number.parseFloat(e.target.value) || 0,
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
