"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AdminService } from "@/lib/services/admin-service";
import { Advisor } from "@/types/auth";
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
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

const AdvisorManagement = () => {
  const [advisors, setAdvisors] = useState<PaginatedResponse<Advisor> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "blocked">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    loadAdvisors();
  }, [currentPage, statusFilter]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (currentPage === 1) {
        loadAdvisors();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const loadAdvisors = async () => {
    try {
      setIsLoading(true);
      const data = await AdminService.getAdvisors({
        search: searchTerm || undefined,
        status: statusFilter,
        page: currentPage,
        per_page: 10,
        sort_by: "created_at",
        sort_order: "desc",
      });
      setAdvisors(data);
    } catch (error: unknown) {
      console.error("Error loading advisors:", error);
      toast.error((error as { message?: string }).message || "Fehler beim Laden der Berater");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (advisor: Advisor, newStatus: "active" | "blocked") => {
    try {
      setActionLoading(advisor.id);
      await AdminService.updateAdvisorStatus(advisor.id, { status: newStatus });

      const action = newStatus === "blocked" ? "gesperrt" : "aktiviert";
      toast.success(`Berater ${advisor.name} wurde erfolgreich ${action}`);

      // Reload advisors to reflect changes
      loadAdvisors();
    } catch (error: unknown) {
      console.error("Error updating advisor status:", error);
      toast.error(
        (error as { message?: string }).message || "Fehler beim Aktualisieren des Status",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAdvisor = async () => {
    if (!selectedAdvisor) return;

    try {
      setActionLoading(selectedAdvisor.id);
      await AdminService.deleteAdvisor(selectedAdvisor.id);

      toast.success(`Berater ${selectedAdvisor.name} wurde erfolgreich gelöscht`);

      // Reload advisors to reflect changes
      loadAdvisors();
      setShowDeleteDialog(false);
      setSelectedAdvisor(null);
    } catch (error: unknown) {
      console.error("Error deleting advisor:", error);
      toast.error((error as { message?: string }).message || "Fehler beim Löschen des Beraters");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Aktiv</Badge>;
      case "blocked":
        return <Badge variant="destructive">Gesperrt</Badge>;
      case "pending":
        return <Badge variant="warning">Ausstehend</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1>Berater-Verwaltung</h1>
          <p className="mt-2 text-muted-foreground">
            Verwalten Sie Ihre Finanzberater und deren Berechtigungen.
          </p>
        </div>
        <Link href="/dashboard/admin/advisors/create">
          <Button>
            <Plus className="w-4 h-4" />
            Neuer Berater
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardContent className="px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Nach Name, E-Mail oder Unternehmen suchen…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="sm:w-52">
              <Select
                value={statusFilter}
                onValueChange={(value: "all" | "active" | "blocked") => setStatusFilter(value)}
              >
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
          <CardDescription>{advisors && `${advisors.total} Berater insgesamt`}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 bg-muted rounded animate-pulse"></div>
              ))}
            </div>
          ) : !advisors || advisors.data.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all"
                  ? "Keine Berater gefunden, die Ihren Suchkriterien entsprechen."
                  : "Noch keine Berater vorhanden."}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Link href="/dashboard/admin/advisors/create">
                  <Button>
                    <Plus className="w-4 h-4" />
                    Ersten Berater erstellen
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-subtle">
                      <th className="label-uppercase text-left py-3 px-4">Berater</th>
                      <th className="label-uppercase text-left py-3 px-4">Unternehmen</th>
                      <th className="label-uppercase text-left py-3 px-4">Status</th>
                      <th className="label-uppercase text-left py-3 px-4">Statistiken</th>
                      <th className="label-uppercase text-left py-3 px-4">Erstellt</th>
                      <th className="label-uppercase text-center py-3 px-4">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:nth-child(even)]:bg-[var(--surface-subtle)]">
                    {advisors.data.map((advisor) => (
                      <tr key={advisor.id}>
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-foreground">{advisor.name}</p>
                            <p className="text-sm text-muted-foreground">{advisor.email}</p>
                            {advisor.phone && (
                              <p className="text-xs text-[var(--ink-tertiary)]">{advisor.phone}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-foreground">{advisor.company || "—"}</td>
                        <td className="py-4 px-4">{getStatusBadge(advisor.status)}</td>
                        <td className="py-4 px-4">
                          <div className="text-sm space-y-0.5">
                            <p className="text-foreground">
                              {advisor.statistics.total_clients} Kunden
                            </p>
                            <p className="text-muted-foreground">
                              {advisor.statistics.completed_rentenchecks}/
                              {advisor.statistics.total_rentenchecks} Rentenchecks
                            </p>
                            <p className="text-primary font-medium currency">
                              {advisor.statistics.completion_rate}% Abschlussrate
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-muted-foreground">
                          {new Date(advisor.created_at).toLocaleDateString("de-DE")}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex justify-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
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

                                {advisor.status === "active" ? (
                                  <DropdownMenuItem
                                    onClick={() => handleStatusChange(advisor, "blocked")}
                                    className="text-destructive"
                                  >
                                    <UserX className="w-4 h-4 mr-2" />
                                    Sperren
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() => handleStatusChange(advisor, "active")}
                                    className="text-success"
                                  >
                                    <UserCheck className="w-4 h-4 mr-2" />
                                    Aktivieren
                                  </DropdownMenuItem>
                                )}

                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedAdvisor(advisor);
                                    setShowDeleteDialog(true);
                                  }}
                                  className="text-destructive"
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

              {advisors.last_page > 1 && (
                <div className="flex items-center justify-between mt-6 pt-5 border-t border-border-subtle">
                  <div className="text-sm text-muted-foreground">
                    Zeige {advisors.from}–{advisors.to} von {advisors.total} Beratern
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-mono tabular-nums">
                      Seite {currentPage} von {advisors.last_page}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Berater löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie den Berater <strong>{selectedAdvisor?.name}</strong> löschen
              möchten? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAdvisor}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={actionLoading === selectedAdvisor?.id}
            >
              {actionLoading === selectedAdvisor?.id ? "Wird gelöscht…" : "Löschen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdvisorManagement;
