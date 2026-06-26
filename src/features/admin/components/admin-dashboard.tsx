"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminService } from "@/lib/services/admin-service";
import { AdminDashboardData } from "@/types/auth";
import {
  Users,
  UserCheck,
  UserX,
  FileText,
  CheckCircle2,
  TrendingUp,
  Plus,
  Settings2,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const data = await AdminService.getDashboard();
      setDashboardData(data);
    } catch (error: unknown) {
      console.error("Error loading dashboard data:", error);
      toast.error(
        (error as { message?: string }).message || "Fehler beim Laden der Dashboard-Daten",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <header className="mb-8">
          <h1>Admin Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Überblick über das System</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="px-6 py-6">
                <div className="h-3 bg-muted rounded mb-3 w-24"></div>
                <div className="h-8 bg-muted rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Keine Dashboard-Daten verfügbar.</p>
          <Button onClick={loadDashboardData} className="mt-4">
            Erneut versuchen
          </Button>
        </div>
      </div>
    );
  }

  const { overview, recent_activity } = dashboardData;

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Willkommen zurück. Hier ist ein Überblick über Ihr System.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/dashboard/admin/advisors">
            <Button>
              <Users className="w-4 h-4" />
              Berater verwalten
            </Button>
          </Link>
          <Link href="/dashboard/admin/pension-settings">
            <Button variant="outline">
              <Settings2 className="w-4 h-4" />
              Pensionsparameter
            </Button>
          </Link>
          <Link href="/dashboard/admin/advisors/create">
            <Button variant="outline">
              <Plus className="w-4 h-4" />
              Neuer Berater
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <AdminStatTile
          label="Gesamt Berater"
          value={overview.total_advisors}
          icon={<Users className="h-4 w-4" />}
        />
        <AdminStatTile
          label="Aktive Berater"
          value={overview.active_advisors}
          icon={<UserCheck className="h-4 w-4 text-success" />}
        />
        <AdminStatTile
          label="Gesperrte Berater"
          value={overview.blocked_advisors}
          icon={<UserX className="h-4 w-4 text-destructive" />}
        />
        <AdminStatTile
          label="Gesamt Kunden"
          value={overview.total_clients}
          icon={<Users className="h-4 w-4 text-primary" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <AdminStatTile
          label="Gesamt Rentenchecks"
          value={overview.total_rentenchecks}
          icon={<FileText className="h-4 w-4" />}
        />
        <AdminStatTile
          label="Abgeschlossen"
          value={overview.completed_rentenchecks}
          accent="success"
          icon={<CheckCircle2 className="h-4 w-4 text-success" />}
        />
        <AdminStatTile
          label="Abschlussrate"
          value={`${overview.completion_rate}%`}
          accent="primary"
          icon={<TrendingUp className="h-4 w-4 text-primary" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link href="/dashboard/admin/advisors">
          <Card className="cursor-pointer transition-colors duration-[180ms] hover:bg-[var(--surface-subtle)]">
            <CardContent className="px-6 py-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[1.125rem] font-medium text-foreground mb-2">
                    Berater-Verwaltung
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Verwalten Sie Finanzberater und deren Berechtigungen.
                  </p>
                  <div className="flex items-center gap-3 text-sm">
                    <Badge variant="outline">{overview.total_advisors} Berater</Badge>
                    <Badge variant="success">{overview.active_advisors} aktiv</Badge>
                  </div>
                </div>
                <Users className="w-6 h-6 text-[var(--ink-tertiary)]" strokeWidth={1.5} />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/admin/pension-settings">
          <Card className="cursor-pointer transition-colors duration-[180ms] hover:bg-[var(--surface-subtle)]">
            <CardContent className="px-6 py-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[1.125rem] font-medium text-foreground mb-2">
                    Pensionsparameter
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Deutsche Steuer- und Sozialversicherungsparameter konfigurieren.
                  </p>
                  <div className="flex items-center gap-3 text-sm">
                    <Badge variant="outline">20 Parameter</Badge>
                    <Badge variant="success">Aktiv</Badge>
                  </div>
                </div>
                <Settings2 className="w-6 h-6 text-[var(--ink-tertiary)]" strokeWidth={1.5} />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" strokeWidth={1.5} />
            Letzte Aktivitäten
          </CardTitle>
          <CardDescription>Die neuesten Rentencheck-Aktivitäten im System.</CardDescription>
        </CardHeader>
        <CardContent>
          {recent_activity.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Keine aktuellen Aktivitäten.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recent_activity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between px-4 py-3 border border-border-subtle rounded-md transition-colors duration-[180ms] hover:bg-[var(--surface-subtle)]"
                >
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className={`w-2 h-2 rounded-full ${
                        activity.is_completed
                          ? "bg-success"
                          : "bg-[color-mix(in_oklch,var(--warning)_85%,var(--foreground))]"
                      }`}
                    />
                    <div>
                      <p className="text-foreground text-sm">
                        Rentencheck für{" "}
                        <span className="text-primary font-medium">{activity.client_name}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Berater: {activity.advisor_name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={activity.is_completed ? "success" : "warning"}>
                      {activity.is_completed ? "Abgeschlossen" : "In Bearbeitung"}
                    </Badge>
                    <p className="text-xs text-[var(--ink-tertiary)] mt-1">
                      {new Date(activity.created_at).toLocaleDateString("de-DE")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

function AdminStatTile({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent?: "success" | "primary";
}) {
  const color =
    accent === "success"
      ? "text-success"
      : accent === "primary"
        ? "text-primary"
        : "text-foreground";
  return (
    <Card>
      <CardContent className="px-5 py-5">
        <div className="flex items-center justify-between">
          <p className="label-uppercase">{label}</p>
          <span className="text-[var(--ink-tertiary)]">{icon}</span>
        </div>
        <p
          className={`mt-3 text-[1.75rem] leading-none currency ${color}`}
          style={{ fontFamily: "var(--font-display), Georgia, serif", fontWeight: 500 }}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

export default AdminDashboard;
