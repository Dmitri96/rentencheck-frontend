"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { RentenblickForm } from "@/features/rentenchecks";
import {
  RentencheckService,
  type Rentencheck,
  type RentencheckData,
} from "@/lib/services/rentencheck-service";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardShell } from "@/components/dashboard-shell";
import { getRentencheckStatusVariant, getRentencheckStatusText } from "@/lib/utils/client-utils";

export default function EditRentencheckPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rentencheck, setRentencheck] = useState<Rentencheck | null>(null);
  const [client, setClient] = useState<{ id: number; full_name: string; email: string } | null>(
    null,
  );
  const [saving, setSaving] = useState(false);

  const clientId = parseInt(params.id as string);
  const rentencheckId = parseInt(params.rentencheckId as string);

  useEffect(() => {
    loadRentencheck();
  }, [clientId, rentencheckId]);

  const loadRentencheck = async () => {
    try {
      setLoading(true);
      const response = await RentencheckService.getRentencheck(clientId, rentencheckId);
      setRentencheck(response.rentencheck);
      setClient(response.client);
    } catch (error: unknown) {
      console.error("Error loading rentencheck:", error);
      toast.error("Fehler beim Laden des Rentenchecks");
      router.push(`/dashboard/clients/${clientId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStepSave = async (step: number, stepData: Partial<RentencheckData>) => {
    if (!rentencheck) return;

    try {
      setSaving(true);
      const response = await RentencheckService.updateStep(
        clientId,
        rentencheck.id,
        step,
        stepData,
      );
      setRentencheck(response.rentencheck);
      toast.success(`Schritt ${step} erfolgreich gespeichert`);
    } catch (error: unknown) {
      console.error("Error saving step:", error);
      toast.error("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteRentencheck = async () => {
    if (!rentencheck) return;

    try {
      setSaving(true);
      await RentencheckService.completeRentencheck(clientId, rentencheck.id);
      toast.success("Rentencheck erfolgreich abgeschlossen.");
      router.push(`/dashboard/clients/${clientId}`);
    } catch (error: unknown) {
      console.error("Error completing rentencheck:", error);
      toast.error("Fehler beim Abschließen des Rentenchecks");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!rentencheck) return;

    try {
      setSaving(true);
      await RentencheckService.downloadPdf(clientId, rentencheck.id);
      toast.success("PDF wird heruntergeladen…");
    } catch (error: unknown) {
      console.error("Error downloading PDF:", error);
      toast.error("Fehler beim Herunterladen des PDFs");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell title="Rentencheck bearbeiten">
        <div className="flex items-center justify-center py-24">
          <Card>
            <CardContent className="px-12 py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <h3 className="mb-2">Rentencheck wird geladen…</h3>
              <p className="text-muted-foreground">Bitte warten Sie einen Moment.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    );
  }

  if (!rentencheck || !client) {
    return (
      <DashboardShell title="Fehler" backHref={`/dashboard/clients/${clientId}`}>
        <div className="flex items-center justify-center py-24">
          <Card>
            <CardContent className="px-12 py-12 text-center">
              <AlertCircle className="h-10 w-10 mx-auto mb-4 text-destructive" strokeWidth={1.25} />
              <h3 className="mb-2">Fehler beim Laden</h3>
              <p className="text-muted-foreground mb-6">
                Der Rentencheck konnte nicht geladen werden.
              </p>
              <Link href={`/dashboard/clients/${clientId}`}>
                <Button>Zurück zum Mandanten</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    );
  }

  const savingIndicator = saving ? (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="text-sm">Speichert…</span>
    </div>
  ) : null;

  return (
    <DashboardShell
      title={`Rentencheck — ${client.full_name}`}
      backHref={`/dashboard/clients/${clientId}`}
      backLabel={`Zurück zu ${client.full_name}`}
      headerActions={savingIndicator}
    >
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h2>{rentencheck.title}</h2>
            <p className="mt-2 text-muted-foreground">
              Bearbeiten Sie den Rentencheck für {client.full_name}.
            </p>
            <div className="flex items-center flex-wrap gap-3 mt-3 text-sm">
              <span className="text-[var(--ink-tertiary)] font-mono">#R-{rentencheck.id}</span>
              <Badge variant={getRentencheckStatusVariant(rentencheck.status)}>
                {getRentencheckStatusText(rentencheck.status)}
              </Badge>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="label-uppercase">Fortschritt</p>
            <p
              className="mt-1 text-[1.75rem] leading-none currency"
              style={{ fontFamily: "var(--font-display), Georgia, serif", fontWeight: 500 }}
            >
              {rentencheck.progress_percentage}%
            </p>
            <p className="text-xs text-[var(--ink-tertiary)] mt-1">
              {rentencheck.completed_steps.length} von 5 Schritten
            </p>
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
    </DashboardShell>
  );
}
