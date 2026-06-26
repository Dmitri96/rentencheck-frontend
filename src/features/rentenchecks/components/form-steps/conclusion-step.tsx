"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ClipboardList, Check } from "lucide-react";
import type { RentencheckData } from "@/lib/services/rentencheck-service";

interface ConclusionStepProps {
  data: RentencheckData;
  updateData: (data: Partial<RentencheckData>) => void;
  isConfirmed: boolean;
}

export function ConclusionStep({ data, updateData, isConfirmed }: ConclusionStepProps) {
  return (
    <div className={`space-y-6 ${isConfirmed ? "opacity-60 pointer-events-none" : ""}`}>
      <div className="space-y-2">
        <Label htmlFor="finalNotes">Letzte Anmerkungen</Label>
        <Textarea
          id="finalNotes"
          value={data.finalNotes}
          onChange={(e) => updateData({ finalNotes: e.target.value })}
          className="min-h-32"
          disabled={isConfirmed}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Datum</Label>
          <Input
            id="date"
            value={data.date}
            onChange={(e) => updateData({ date: e.target.value })}
            placeholder="25.05.2025"
            disabled={isConfirmed}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Ort</Label>
          <Input
            id="location"
            value={data.location}
            onChange={(e) => updateData({ location: e.target.value })}
            disabled={isConfirmed}
          />
        </div>
      </div>

      {isConfirmed && (
        <div className="flex items-center gap-2 rounded-md border border-[color-mix(in_oklch,var(--success)_30%,var(--background))] bg-[color-mix(in_oklch,var(--success)_10%,var(--background))] px-4 py-3">
          <Check className="h-4 w-4 text-success" strokeWidth={2} />
          <span className="text-sm text-success font-medium">
            Abschluss bestätigt — bereit für PDF-Generierung.
          </span>
        </div>
      )}

      <div className="rounded-md border border-border bg-[var(--surface-subtle)] px-6 py-5">
        <div className="flex items-start gap-3">
          <ClipboardList className="h-5 w-5 text-foreground mt-0.5" strokeWidth={1.5} />
          <div>
            <h4 className="text-foreground font-medium mb-1">Formular abgeschlossen</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Alle Schritte wurden durchlaufen. Sie können nun das PDF generieren oder einzelne
              Schritte bearbeiten, indem Sie die entsprechenden Abschnitte entsperren.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
