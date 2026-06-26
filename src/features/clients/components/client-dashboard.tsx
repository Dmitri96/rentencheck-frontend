"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Mail,
  Phone,
  MapPin,
  Edit3,
  FileText,
  Play,
  Trash2,
  Filter,
  Loader2,
  Search,
  Users,
  CheckCircle2,
  PauseCircle,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ClientService } from "@/lib/services/client-service";
import type { Client } from "@/types";
import { RentencheckService } from "@/lib/services/rentencheck-service";
import { DashboardShell } from "@/components/dashboard-shell";

export function ClientDashboard() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [creatingRentencheck, setCreatingRentencheck] = useState<number | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await ClientService.getClients(1);
      setClients(response.data);
    } catch (error: unknown) {
      console.error("Error loading clients:", error);
      toast.error("Fehler beim Laden der Mandanten");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (clientId: number) => {
    if (!confirm("Möchten Sie diesen Mandanten wirklich deaktivieren?")) {
      return;
    }

    try {
      setDeleteLoading(clientId);
      await ClientService.deleteClient(clientId);
      toast.success("Mandant erfolgreich deaktiviert");
      setClients(clients.filter((client) => client.id !== clientId));
    } catch (error: unknown) {
      console.error("Error deleting client:", error);
      toast.error("Fehler beim Deaktivieren des Mandanten");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleCreateRentencheckForClient = async (client: Client) => {
    try {
      setCreatingRentencheck(client.id);
      const response = await RentencheckService.createRentencheck(client.id, {
        title: `Rentencheck für ${client.full_name}`,
      });
      router.push(`/dashboard/clients/${client.id}/rentencheck/${response.rentencheck.id}`);
    } catch (error: unknown) {
      console.error("Error creating rentencheck:", error);
      toast.error("Fehler beim Erstellen des Rentenchecks");
    } finally {
      setCreatingRentencheck(null);
    }
  };

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && client.is_active) ||
      (statusFilter === "inactive" && !client.is_active);

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("de-DE");

  if (loading) {
    return (
      <DashboardShell title="Berater Dashboard">
        <div className="flex items-center justify-center py-24">
          <Card>
            <CardContent className="px-12 py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <h3 className="mb-2">Mandanten werden geladen…</h3>
              <p className="text-muted-foreground">Bitte warten Sie einen Moment.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    );
  }

  const newThisWeek = clients.filter((c) => {
    const createdDate = new Date(c.created_at);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return createdDate > weekAgo;
  }).length;

  return (
    <DashboardShell title="Berater Dashboard">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2>Meine Mandanten</h2>
          <p className="mt-2 text-muted-foreground">
            Verwalten Sie Ihre Mandanten und erstellen Sie Rentenchecks.
          </p>
        </div>
        <Link href="/dashboard/clients/new">
          <Button>
            <Plus className="h-4 w-4" />
            Mandant anlegen
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatTile
          label="Gesamt Mandanten"
          value={clients.length}
          icon={<Users className="h-4 w-4" />}
        />
        <StatTile
          label="Aktive Mandanten"
          value={clients.filter((c) => c.is_active).length}
          icon={<CheckCircle2 className="h-4 w-4 text-success" />}
        />
        <StatTile
          label="Inaktive Mandanten"
          value={clients.filter((c) => !c.is_active).length}
          icon={<PauseCircle className="h-4 w-4 text-muted-foreground" />}
        />
        <StatTile
          label="Neue diese Woche"
          value={newThisWeek}
          icon={<Sparkles className="h-4 w-4 text-primary" />}
        />
      </div>

      <Card className="mb-6">
        <CardContent className="px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Mandanten suchen (Name, E-Mail)…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
                className="h-10 rounded-md border border-input bg-surface px-3 text-sm text-foreground focus-visible:border-border-strong focus-visible:ring-[3px] focus-visible:ring-ring/40 outline-none transition-colors duration-[180ms]"
              >
                <option value="all">Alle Status</option>
                <option value="active">Aktiv</option>
                <option value="inactive">Inaktiv</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => (
          <Card key={client.id} className="group">
            <CardContent className="px-6 py-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-[1.125rem] leading-tight truncate">{client.full_name}</h3>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant={client.is_active ? "success" : "outline"}>
                      {client.is_active ? "Aktiv" : "Inaktiv"}
                    </Badge>
                    {client.age != null && (
                      <span className="text-sm text-muted-foreground">{client.age} Jahre</span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeleteClient(client.id)}
                  disabled={deleteLoading === client.id}
                  aria-label="Mandant deaktivieren"
                >
                  {deleteLoading === client.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-destructive" />
                  )}
                </Button>
              </div>

              <div className="space-y-2 mb-6">
                {client.formatted_address && (
                  <div className="flex items-start text-sm text-muted-foreground gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-[var(--ink-tertiary)] shrink-0" />
                    <span className="truncate">{client.formatted_address}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-muted-foreground gap-2">
                  <Mail className="h-4 w-4 text-[var(--ink-tertiary)] shrink-0" />
                  <span className="truncate">{client.email}</span>
                </div>
                {client.phone && (
                  <div className="flex items-center text-sm text-muted-foreground gap-2">
                    <Phone className="h-4 w-4 text-[var(--ink-tertiary)] shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                )}
                <p className="text-xs text-[var(--ink-tertiary)] pt-1">
                  Angelegt {formatDate(client.created_at)}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border-subtle gap-2">
                <div className="flex gap-2">
                  <Link href={`/dashboard/clients/${client.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit3 className="h-3.5 w-3.5" />
                      Bearbeiten
                    </Button>
                  </Link>
                  <Link href={`/dashboard/clients/${client.id}`}>
                    <Button variant="outline" size="sm">
                      <FileText className="h-3.5 w-3.5" />
                      Übersicht
                    </Button>
                  </Link>
                </div>
                <Button
                  onClick={() => handleCreateRentencheckForClient(client)}
                  disabled={creatingRentencheck === client.id}
                  size="sm"
                >
                  {creatingRentencheck === client.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                  {creatingRentencheck === client.id ? "Erstelle…" : "Start"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClients.length === 0 && !loading && (
        <Card>
          <CardContent className="px-12 py-16 text-center">
            <Users
              className="h-10 w-10 mx-auto text-[var(--ink-tertiary)] mb-4"
              strokeWidth={1.25}
            />
            <h3 className="mb-2">Keine Mandanten gefunden</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm
                ? "Ihre Suche ergab keine Treffer."
                : "Sie haben noch keine Mandanten angelegt."}
            </p>
            <Link href="/dashboard/clients/new">
              <Button>
                <Plus className="h-4 w-4" />
                Ersten Mandanten anlegen
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </DashboardShell>
  );
}

function StatTile({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="px-5 py-5">
        <div className="flex items-center justify-between">
          <p className="label-uppercase">{label}</p>
          <span className="text-[var(--ink-tertiary)]">{icon}</span>
        </div>
        <p
          className="mt-3 text-[2rem] leading-none currency"
          style={{ fontFamily: "var(--font-display), Georgia, serif", fontWeight: 500 }}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
