"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Settings, LogOut, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import { RentenblickForm } from "@/components/rentenblick-form"
import { RentencheckService, type Rentencheck, type RentencheckData } from "@/lib/services/rentencheck-service"
import { Card, CardContent } from "@/components/ui/card"

export default function EditRentencheckPage() {
  const params = useParams()
  const router = useRouter()
  const { logout } = useAuth()
  const [loading, setLoading] = useState(true)
  const [rentencheck, setRentencheck] = useState<Rentencheck | null>(null)
  const [client, setClient] = useState<{ id: number; full_name: string; email: string } | null>(null)
  const [saving, setSaving] = useState(false)

  const clientId = parseInt(params.id as string)
  const rentencheckId = parseInt(params.rentencheckId as string)

  useEffect(() => {
    loadRentencheck()
  }, [clientId, rentencheckId])

  const loadRentencheck = async () => {
    try {
      setLoading(true)
      console.log('📥 EditRentencheckPage.loadRentencheck called with:', {
        clientId,
        rentencheckId
      })
      
      const response = await RentencheckService.getRentencheck(clientId, rentencheckId)
      
      console.log('✅ Loaded rentencheck:', response.rentencheck)
      
      setRentencheck(response.rentencheck)
      setClient(response.client)
    } catch (error: any) {
      console.error("Error loading rentencheck:", error)
      toast.error("Fehler beim Laden des Rentenchecks")
      router.push(`/dashboard/clients/${clientId}`)
    } finally {
      setLoading(false)
    }
  }

  const handleStepSave = async (step: number, stepData: Partial<RentencheckData>) => {
    if (!rentencheck) return

    console.log('🎯 EditRentencheckPage.handleStepSave called with:', {
      clientId,
      rentencheckId,
      'rentencheck.id': rentencheck.id,
      step,
      stepData
    })

    try {
      setSaving(true)
      const response = await RentencheckService.updateStep(
        clientId,
        rentencheck.id,
        step,
        stepData
      )
      setRentencheck(response.rentencheck)
      toast.success(`Schritt ${step} erfolgreich gespeichert`)
    } catch (error: any) {
      console.error("Error saving step:", error)
      toast.error("Fehler beim Speichern")
    } finally {
      setSaving(false)
    }
  }

  const handleCompleteRentencheck = async () => {
    if (!rentencheck) return

    try {
      setSaving(true)
      await RentencheckService.completeRentencheck(clientId, rentencheck.id)
      toast.success("Rentencheck erfolgreich abgeschlossen!")
      router.push(`/dashboard/clients/${clientId}`)
    } catch (error: any) {
      console.error("Error completing rentencheck:", error)
      toast.error("Fehler beim Abschließen des Rentenchecks")
    } finally {
      setSaving(false)
    }
  }

  const handleDownloadPdf = async () => {
    if (!rentencheck) return

    try {
      setSaving(true)
      await RentencheckService.downloadPdf(clientId, rentencheck.id)
      toast.success("PDF wird heruntergeladen...")
    } catch (error: any) {
      console.error("Error downloading PDF:", error)
      toast.error("Fehler beim Herunterladen des PDFs")
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      router.push("/login")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Rentencheck wird geladen...</h3>
            <p className="text-gray-600">Bitte warten Sie einen Moment.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!rentencheck || !client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Fehler beim Laden</h3>
            <p className="text-gray-600 mb-6">Der Rentencheck konnte nicht geladen werden.</p>
            <Link href={`/dashboard/clients/${clientId}`}>
              <Button>Zurück zum Mandanten</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href={`/dashboard/clients/${clientId}`}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Zurück zu {client.full_name}</span>
              </Link>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">RENTENBLICK.de</h1>
                <p className="text-sm text-gray-600">
                  Rentencheck bearbeiten - {client.full_name}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {saving && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Speichert...</span>
                </div>
              )}
              <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-600">
                <Settings className="h-4 w-4" />
                Einstellungen
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-2 text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {rentencheck.title}
                </h2>
                <p className="text-gray-600">
                  Bearbeiten Sie den Rentencheck für {client.full_name}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span>Rentencheck ID: #{rentencheck.id}</span>
                  <span>Status: {rentencheck.status === 'draft' ? 'Entwurf' : rentencheck.status === 'completed' ? 'Abgeschlossen' : 'Archiviert'}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Fortschritt</div>
                <div className="text-2xl font-bold text-blue-600">
                  {rentencheck.progress_percentage}%
                </div>
                <div className="text-xs text-gray-500">
                  {rentencheck.completed_steps.length} von 5 Schritten
                </div>
                {/* Temporary Debug Button */}
                {rentencheck.completed_steps.length === 4 && (
                  <Button
                    onClick={async () => {
                      try {
                        await RentencheckService.markStepCompleted(clientId, rentencheckId, 5)
                        window.location.reload()
                      } catch (error) {
                        console.error('Error marking step 5 complete:', error)
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="mt-2 text-orange-600 border-orange-200"
                  >
                    🔧 Debug: Mark Step 5 Complete
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          <RentenblickForm 
            initialData={{
              ...rentencheck.step_1_data,
              ...rentencheck.step_2_data,
              ...rentencheck.step_3_data,
              ...rentencheck.step_4_data,
              ...rentencheck.step_5_data,
            }}
            onStepSave={handleStepSave}
            onComplete={handleCompleteRentencheck}
            onDownloadPdf={handleDownloadPdf}
            completedSteps={rentencheck.completed_steps}
            saving={saving}
          />
        </div>
      </div>
    </div>
  )
} 