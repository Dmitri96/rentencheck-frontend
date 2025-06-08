'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import { Badge } from '../../ui/badge'
import { AdminService } from '../../../lib/services/admin-service'
import { Advisor } from '../../../types/auth'
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Plus, 
  UserCheck, 
  UserX, 
  Trash2, 
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../ui/alert-dialog'

interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

const AdvisorManagement = () => {
  const [advisors, setAdvisors] = useState<PaginatedResponse<Advisor> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  useEffect(() => {
    loadAdvisors()
  }, [currentPage, statusFilter])

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (currentPage === 1) {
        loadAdvisors()
      } else {
        setCurrentPage(1)
      }
    }, 500)

    return () => clearTimeout(delayedSearch)
  }, [searchTerm])

  const loadAdvisors = async () => {
    try {
      setIsLoading(true)
      const data = await AdminService.getAdvisors({
        search: searchTerm || undefined,
        status: statusFilter,
        page: currentPage,
        per_page: 10,
        sort_by: 'created_at',
        sort_order: 'desc'
      })
      setAdvisors(data)
    } catch (error: any) {
      console.error('Error loading advisors:', error)
      toast.error(error.message || 'Fehler beim Laden der Berater')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (advisor: Advisor, newStatus: 'active' | 'blocked') => {
    try {
      setActionLoading(advisor.id)
      await AdminService.updateAdvisorStatus(advisor.id, { status: newStatus })
      
      const action = newStatus === 'blocked' ? 'gesperrt' : 'aktiviert'
      toast.success(`Berater ${advisor.name} wurde erfolgreich ${action}`)
      
      // Reload advisors to reflect changes
      loadAdvisors()
    } catch (error: any) {
      console.error('Error updating advisor status:', error)
      toast.error(error.message || 'Fehler beim Aktualisieren des Status')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteAdvisor = async () => {
    if (!selectedAdvisor) return

    try {
      setActionLoading(selectedAdvisor.id)
      await AdminService.deleteAdvisor(selectedAdvisor.id)
      
      toast.success(`Berater ${selectedAdvisor.name} wurde erfolgreich gelöscht`)
      
      // Reload advisors to reflect changes
      loadAdvisors()
      setShowDeleteDialog(false)
      setSelectedAdvisor(null)
    } catch (error: any) {
      console.error('Error deleting advisor:', error)
      toast.error(error.message || 'Fehler beim Löschen des Beraters')
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Aktiv</Badge>
      case 'blocked':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Gesperrt</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Ausstehend</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Berater-Verwaltung</h1>
          <p className="text-gray-600 mt-2">
            Verwalten Sie Ihre Finanzberater und deren Berechtigungen
          </p>
        </div>
        <Link href="/dashboard/admin/advisors/create">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Neuer Berater
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Nach Name, E-Mail oder Unternehmen suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status filtern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="active">Aktiv</SelectItem>
                  <SelectItem value="blocked">Gesperrt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advisors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Berater-Übersicht</CardTitle>
          <CardDescription>
            {advisors && `${advisors.total} Berater insgesamt`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : !advisors || advisors.data.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Keine Berater gefunden, die Ihren Suchkriterien entsprechen'
                  : 'Noch keine Berater vorhanden'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Link href="/dashboard/admin/advisors/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Ersten Berater erstellen
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Berater</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Unternehmen</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Statistiken</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Erstellt</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {advisors.data.map((advisor) => (
                      <tr key={advisor.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{advisor.name}</p>
                            <p className="text-sm text-gray-600">{advisor.email}</p>
                            {advisor.phone && (
                              <p className="text-sm text-gray-500">{advisor.phone}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-gray-900">{advisor.company || '-'}</p>
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(advisor.status)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm">
                            <p className="text-gray-900">
                              {advisor.statistics.total_clients} Kunden
                            </p>
                            <p className="text-gray-600">
                              {advisor.statistics.completed_rentenchecks}/{advisor.statistics.total_rentenchecks} Rentenchecks
                            </p>
                            <p className="text-blue-600 font-medium">
                              {advisor.statistics.completion_rate}% Abschlussrate
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-600">
                            {new Date(advisor.created_at).toLocaleDateString('de-DE')}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex justify-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={actionLoading === advisor.id}
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/dashboard/admin/advisors/${advisor.id}`}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Details anzeigen
                                  </Link>
                                </DropdownMenuItem>
                                
                                {advisor.status === 'active' ? (
                                  <DropdownMenuItem
                                    onClick={() => handleStatusChange(advisor, 'blocked')}
                                    className="text-red-600"
                                  >
                                    <UserX className="w-4 h-4 mr-2" />
                                    Sperren
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() => handleStatusChange(advisor, 'active')}
                                    className="text-green-600"
                                  >
                                    <UserCheck className="w-4 h-4 mr-2" />
                                    Aktivieren
                                  </DropdownMenuItem>
                                )}
                                
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedAdvisor(advisor)
                                    setShowDeleteDialog(true)
                                  }}
                                  className="text-red-600"
                                  disabled={advisor.statistics.total_clients > 0}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Löschen
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {advisors.last_page > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t">
                  <div className="text-sm text-gray-600">
                    Zeige {advisors.from} bis {advisors.to} von {advisors.total} Beratern
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-medium">
                      Seite {currentPage} von {advisors.last_page}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === advisors.last_page}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Berater löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie den Berater <strong>{selectedAdvisor?.name}</strong> löschen möchten?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAdvisor}
              className="bg-red-600 hover:bg-red-700"
              disabled={actionLoading === selectedAdvisor?.id}
            >
              {actionLoading === selectedAdvisor?.id ? 'Wird gelöscht...' : 'Löschen'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default AdvisorManagement 