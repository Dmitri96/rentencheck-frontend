"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Client } from "@/types"
import type { Rentencheck } from "@/lib/services/rentencheck-service"
import { getClientStatusColor, getClientStatusText } from "@/lib/utils/client-utils"

interface ClientStatsCardProps {
  client: Client
  rentenchecks: Rentencheck[]
}

export function ClientStatsCard({ client, rentenchecks }: ClientStatsCardProps) {
  const completedRentenchecks = rentenchecks.filter(r => r.status === 'completed').length
  const draftRentenchecks = rentenchecks.filter(r => r.status === 'draft').length

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Statistiken</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Rentenchecks gesamt</span>
          <span className="font-semibold">{rentenchecks.length}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Abgeschlossen</span>
          <span className="font-semibold text-green-600">{completedRentenchecks}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Entwürfe</span>
          <span className="font-semibold text-yellow-600">{draftRentenchecks}</span>
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-sm text-gray-600">Status</span>
          <Badge className={`text-xs ${getClientStatusColor(client.is_active)}`}>
            {getClientStatusText(client.is_active)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
} 