"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RentenblickData } from "../../rentenblick-form";

/**
 * Props interface for the Professional Provision Section component
 */
interface ProfessionalProvisionSectionProps {
  data: RentenblickData;
  updateData: (data: Partial<RentenblickData>) => void;
  isConfirmed: boolean;
}

/**
 * ProfessionalProvisionSection Component
 *
 * Handles professional provision works claims input with checkbox-controlled form fields.
 * Follows single responsibility principle and accessibility best practices.
 */
export function ProfessionalProvisionSection({
  data,
  updateData,
  isConfirmed,
}: ProfessionalProvisionSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <Checkbox
          id="professionalProvisionWorks"
          checked={data.professionalProvisionWorks}
          onCheckedChange={(checked) =>
            updateData({ professionalProvisionWorks: checked as boolean })
          }
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
                <Label
                  htmlFor="professionalProvisionAge"
                  className="text-sm font-medium text-gray-700"
                >
                  Im Alter von
                </Label>
                <Input
                  id="professionalProvisionAge"
                  type="number"
                  value={data.professionalProvisionAge || ""}
                  onChange={(e) =>
                    updateData({ professionalProvisionAge: Number.parseInt(e.target.value) || 0 })
                  }
                  placeholder="0"
                  className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                  disabled={isConfirmed}
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="professionalProvisionAmount"
                  className="text-sm font-medium text-gray-700"
                >
                  Wie viel
                </Label>
                <Input
                  id="professionalProvisionAmount"
                  type="number"
                  value={data.professionalProvisionAmount || ""}
                  onChange={(e) =>
                    updateData({
                      professionalProvisionAmount: Number.parseFloat(e.target.value) || 0,
                    })
                  }
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
  );
}
