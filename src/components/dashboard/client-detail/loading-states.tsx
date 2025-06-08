"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import Link from "next/link"

export function ClientLoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-12 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Mandant wird geladen...</h3>
          <p className="text-gray-600">Bitte warten Sie einen Moment.</p>
        </CardContent>
      </Card>
    </div>
  )
}

export function ClientErrorState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-12 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Mandant nicht gefunden</h3>
          <p className="text-gray-600 mb-6">Der angeforderte Mandant konnte nicht geladen werden.</p>
          <Link href="/dashboard">
            <Button>Zurück zum Dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
} 