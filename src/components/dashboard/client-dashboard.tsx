"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Search,
  Settings,
  LogOut,
  Mail,
  Phone,
  MapPin,
  Edit3,
  FileText,
  Play,
  Trash2,
  Filter,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ClientService } from "@/lib/services/client-service"
import { useAuth } from "@/hooks/useAuth"
import type { Client, ClientFilters } from "@/types"
import { RentencheckService } from "@/lib/services/rentencheck-service"

export function ClientDashboard() {
  const router = useRouter()
  const { logout } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null)
  const [creatingRentencheck, setCreatingRentencheck] = useState<number | null>(null)

  // Load clients on component mount
  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      setLoading(true)
      const response = await ClientService.getClients(1) // Load first page
      setClients(response.data)
    } catch (error: any) {
      console.error("Error loading clients:", error)
      toast.error("Fehler beim Laden der Mandanten")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClient = async (clientId: number) => {
    if (!confirm("Möchten Sie diesen Mandanten wirklich deaktivieren?")) {
      return
    }

    try {
      setDeleteLoading(clientId)
      await ClientService.deleteClient(clientId)
      toast.success("Mandant erfolgreich deaktiviert")
      
      // Remove from local state or reload
      setClients(clients.filter(client => client.id !== clientId))
    } catch (error: any) {
      console.error("Error deleting client:", error)
      toast.error("Fehler beim Deaktivieren des Mandanten")
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleCreateRentencheckForClient = async (client: Client) => {
    try {
      setCreatingRentencheck(client.id)
      
      // Create new rentencheck first
      const response = await RentencheckService.createRentencheck(client.id, {
        title: `Rentencheck für ${client.full_name}`
      })
      
      // Navigate to the specific rentencheck edit page
      router.push(`/dashboard/clients/${client.id}/rentencheck/${response.rentencheck.id}`)
      
    } catch (error: any) {
      console.error("Error creating rentencheck:", error)
      toast.error("Fehler beim Erstellen des Rentenchecks")
    } finally {
      setCreatingRentencheck(null)
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

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "active" && client.is_active) ||
      (statusFilter === "inactive" && !client.is_active)

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? "bg-green-100 text-green-800" 
      : "bg-gray-100 text-gray-800"
  }

  const getStatusText = (isActive: boolean) => {
    return isActive ? "Aktiv" : "Inaktiv"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Mandanten werden geladen...</h3>
            <p className="text-gray-600">Bitte warten Sie einen Moment.</p>
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
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">RENTENBLICK.de</h1>
                <p className="text-sm text-gray-600">Berater Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
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

      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Meine Mandanten</h2>
            <p className="text-gray-600">Verwalten Sie Ihre Mandanten und erstellen Sie Rentenchecks</p>
          </div>
          <Link href="/dashboard/clients/new">
            <Button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="h-5 w-5" />
              Mandant anlegen
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Gesamt Mandanten</p>
                  <p className="text-3xl font-bold text-gray-900">{clients.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aktive Mandanten</p>
                  <p className="text-3xl font-bold text-green-600">
                    {clients.filter((c) => c.is_active).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inaktive Mandanten</p>
                  <p className="text-3xl font-bold text-gray-600">
                    {clients.filter((c) => !c.is_active).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">⏸️</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Neue Mandanten</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {clients.filter((c) => {
                      const createdDate = new Date(c.created_at)
                      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                      return createdDate > weekAgo
                    }).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">✨</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Mandanten suchen (Name, E-Mail)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Alle Status</option>
                  <option value="active">Aktiv</option>
                  <option value="inactive">Inaktiv</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <Card
              key={client.id}
              className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200 group"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {client.full_name}
                    </h3>
                    <Badge className={`text-xs ${getStatusColor(client.is_active)}`}>
                      {getStatusText(client.is_active)}
                    </Badge>
                    {client.age && (
                      <p className="text-sm text-gray-500 mt-1">
                        {client.age} Jahre alt
                      </p>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteClient(client.id)}
                    disabled={deleteLoading === client.id}
                  >
                    {deleteLoading === client.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-red-500" />
                    )}
                  </Button>
                </div>

                <div className="space-y-3 mb-6">
                  {client.formatted_address && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{client.formatted_address}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="text-xs">
                      Angelegt: {formatDate(client.created_at)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex space-x-2">
                    <Link href={`/dashboard/clients/${client.id}/edit`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-orange-600 border-orange-200 hover:bg-orange-50"
                      >
                        <Edit3 className="h-3 w-3" />
                        Bearbeiten
                      </Button>
                    </Link>
                    <Link href={`/dashboard/clients/${client.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-purple-600 border-purple-200 hover:bg-purple-50"
                      >
                        <FileText className="h-3 w-3" />
                        Rentenchecks
                      </Button>
                    </Link>
                  </div>
                  <Button 
                    onClick={() => handleCreateRentencheckForClient(client)}
                    disabled={creatingRentencheck === client.id}
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                  >
                    {creatingRentencheck === client.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Play className="h-3 w-3" />
                    )}
                    {creatingRentencheck === client.id ? "Erstelle..." : "START"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredClients.length === 0 && !loading && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Keine Mandanten gefunden</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? "Ihre Suche ergab keine Treffer." : "Sie haben noch keine Mandanten angelegt."}
              </p>
              <Link href="/dashboard/clients/new">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Ersten Mandanten anlegen
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
