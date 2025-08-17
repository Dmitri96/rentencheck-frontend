import React, { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'
import type { PensionParameters } from './types'

interface ParametersOverviewProps {
  parameters: PensionParameters
}

/**
 * Parameter-Übersicht-Komponente
 * 
 * Zeigt aktuelle Pensionsberechnungsparameter in einem Raster-Layout an.
 * Für Performance-Optimierung memoized.
 */
export const ParametersOverview = memo<ParametersOverviewProps>(({ parameters }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Aktuelle Berechnungsparameter
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="space-y-1">
            <p className="font-medium text-gray-700">Inflation</p>
            <p className="text-lg font-semibold text-blue-600">
              {parameters.economic_assumptions.inflation_rate.toFixed(1)}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-gray-700">Krankenversicherung</p>
            <p className="text-lg font-semibold text-green-600">
              {parameters.social_insurance.total_insurance_rate.toFixed(1)}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-gray-700">Kapitalrendite</p>
            <p className="text-lg font-semibold text-orange-600">
              {parameters.economic_assumptions.investment_return_rate.toFixed(1)}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-gray-700">Spitzensteuersatz</p>
            <p className="text-lg font-semibold text-red-600">
              {parameters.tax_system.rates.stufe_5?.toFixed(0)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

ParametersOverview.displayName = 'ParameterUebersicht' 