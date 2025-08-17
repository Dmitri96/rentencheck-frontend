'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'
import { AdminService } from '../../../lib/services/admin-service'
import { AdminDashboardData } from '../../../types/auth'
import { Users, UserCheck, UserX, FileText, CheckCircle, TrendingUp, Plus, Settings2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      const data = await AdminService.getDashboard()
      setDashboardData(data)
    } catch (error: any) {
      console.error('Error loading dashboard data:', error)
      toast.error(error.message || 'Fehler beim Laden der Dashboard-Daten')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Überblick über das System</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Keine Dashboard-Daten verfügbar</p>
          <Button onClick={loadDashboardData} className="mt-4">
            Erneut versuchen
          </Button>
        </div>
      </div>
    )
  }

  const { overview, recent_activity } = dashboardData

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Willkommen zurück! Hier ist ein Überblick über Ihr System.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/admin/advisors">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Users className="w-4 h-4 mr-2" />
              Berater verwalten
            </Button>
          </Link>
          <Link href="/dashboard/admin/pension-settings">
            <Button variant="outline">
              <Settings2 className="w-4 h-4 mr-2" />
              Pensionsparameter
            </Button>
          </Link>
          <Link href="/dashboard/admin/advisors/create">
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Neuer Berater
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gesamt Berater</p>
                <p className="text-3xl font-bold text-gray-900">{overview.total_advisors}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktive Berater</p>
                <p className="text-3xl font-bold text-gray-900">{overview.active_advisors}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gesperrte Berater</p>
                <p className="text-3xl font-bold text-gray-900">{overview.blocked_advisors}</p>
              </div>
              <UserX className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gesamt Kunden</p>
                <p className="text-3xl font-bold text-gray-900">{overview.total_clients}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rentencheck Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gesamt Rentenchecks</p>
                <p className="text-2xl font-bold text-gray-900">{overview.total_rentenchecks}</p>
              </div>
              <FileText className="w-6 h-6 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Abgeschlossen</p>
                <p className="text-2xl font-bold text-green-600">{overview.completed_rentenchecks}</p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Abschlussrate</p>
                <p className="text-2xl font-bold text-blue-600">{overview.completion_rate}%</p>
              </div>
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link href="/dashboard/admin/advisors">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Berater-Verwaltung</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Verwalten Sie Finanzberater und deren Berechtigungen
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-blue-600 font-medium">
                      {overview.total_advisors} Berater
                    </span>
                    <span className="text-green-600 font-medium">
                      {overview.active_advisors} aktiv
                    </span>
                  </div>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/admin/pension-settings">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Pensionsparameter</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Deutsche Steuer- und Sozialversicherungsparameter konfigurieren
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-orange-600 font-medium">
                      20 Parameter
                    </span>
                    <span className="text-green-600 font-medium">
                      Aktiv
                    </span>
                  </div>
                </div>
                <Settings2 className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Letzte Aktivitäten
          </CardTitle>
          <CardDescription>
            Die neuesten Rentencheck-Aktivitäten im System
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recent_activity.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Keine aktuellen Aktivitäten</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recent_activity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      activity.is_completed ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900">
                        Rentencheck für <span className="text-blue-600">{activity.client_name}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Berater: {activity.advisor_name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      activity.is_completed
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {activity.is_completed ? 'Abgeschlossen' : 'In Bearbeitung'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.created_at).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminDashboard 