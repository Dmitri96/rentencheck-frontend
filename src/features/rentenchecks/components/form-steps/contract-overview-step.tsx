"use client";

import React from "react";
import { useContractManagement } from "@/hooks/use-contract-management";
import type { RentencheckData } from "@/lib/services/rentencheck-service";
import { StatutoryPensionSection } from "./sections/statutory-pension-section";
import { ProfessionalProvisionSection } from "./sections/professional-provision-section";
import { PublicServiceProvisionSection } from "./sections/public-service-provision-section";
import { CivilServiceProvisionSection } from "./sections/civil-service-provision-section";
import { PayoutContractsSection } from "./sections/payout-contracts-section";
import { PensionContractsSection } from "./sections/pension-contracts-section";
import { AdditionalIncomeSection } from "./sections/additional-income-section";

/**
 * Props interface for the Contract Overview Step component
 * This step handles collection of existing pension contracts and future income expectations
 */
interface ContractOverviewStepProps {
  data: RentencheckData;
  updateData: (data: Partial<RentencheckData>) => void;
  isConfirmed: boolean;
}

/**
 * ContractOverviewStep Component
 *
 * Main orchestrator component that coordinates all pension-related sections.
 * Follows Next.js best practices with proper component composition and separation of concerns.
 *
 * Architecture:
 * - Uses custom hook for business logic separation (useContractManagement)
 * - Composes multiple focused section components
 * - Each section handles its own UI and validation
 * - Maintains clean data flow through props
 */
export function ContractOverviewStep({ data, updateData, isConfirmed }: ContractOverviewStepProps) {
  /**
   * Custom hook that handles all contract-related business logic
   * Provides clean separation of concerns and reusable contract management
   */
  const contractManagement = useContractManagement(data, updateData, isConfirmed);

  return (
    <div className={`space-y-8 ${isConfirmed ? "opacity-60 pointer-events-none" : ""}`}>
      {/* Pension Claims Sections */}
      <div className="space-y-6">
        <StatutoryPensionSection data={data} updateData={updateData} isConfirmed={isConfirmed} />

        <ProfessionalProvisionSection
          data={data}
          updateData={updateData}
          isConfirmed={isConfirmed}
        />

        <PublicServiceProvisionSection
          data={data}
          updateData={updateData}
          isConfirmed={isConfirmed}
        />

        <CivilServiceProvisionSection
          data={data}
          updateData={updateData}
          isConfirmed={isConfirmed}
        />
      </div>

      {/* Contract Management Sections */}
      <PayoutContractsSection
        data={data}
        contractManagement={contractManagement}
        isConfirmed={isConfirmed}
      />

      <PensionContractsSection
        data={data}
        contractManagement={contractManagement}
        isConfirmed={isConfirmed}
      />

      <AdditionalIncomeSection
        data={data}
        contractManagement={contractManagement}
        isConfirmed={isConfirmed}
      />

      {/* Confirmation Status */}
      {isConfirmed && (
        <div className="bg-[color-mix(in_oklch,var(--success)_10%,var(--background))] p-4 rounded-lg border border-[color-mix(in_oklch,var(--success)_30%,var(--background))]">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span className="text-success font-medium">Vertragsübersicht bestätigt</span>
          </div>
        </div>
      )}
    </div>
  );
}
