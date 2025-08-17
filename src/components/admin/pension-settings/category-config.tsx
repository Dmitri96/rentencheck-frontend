import React from 'react'
import { 
  Settings2, 
  TrendingUp, 
  Calculator,
  Scale,
  MapPin
} from 'lucide-react'
import type { CategoryConfig } from './types'

export const categoryConfig: Record<string, CategoryConfig> = {
  social_insurance: {
    title: 'Sozialversicherung',
    description: 'Kranken- und Pflegeversicherungsbeiträge für Rentner',
    icon: <Settings2 className="h-5 w-5" />,
    color: 'bg-blue-500'
  },
  economic_assumptions: {
    title: 'Wirtschaftliche Annahmen',
    description: 'Inflation, Zinssätze und Rentenentwicklung',
    icon: <TrendingUp className="h-5 w-5" />,
    color: 'bg-green-500'
  },
  tax_brackets: {
    title: 'Steuersätze',
    description: 'Deutsche Einkommensteuer nach Stufen',
    icon: <Calculator className="h-5 w-5" />,
    color: 'bg-orange-500'
  },
  tax_thresholds: {
    title: 'Steuergrenzen',
    description: 'Einkommensgrenzen für Steuerstufen',
    icon: <Scale className="h-5 w-5" />,
    color: 'bg-purple-500'
  },
  regional_taxes: {
    title: 'Regionale Steuern',
    description: 'Kirchensteuer und Solidaritätszuschlag',
    icon: <MapPin className="h-5 w-5" />,
    color: 'bg-red-500'
  }
} 