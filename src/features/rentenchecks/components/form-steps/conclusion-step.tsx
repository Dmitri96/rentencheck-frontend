"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { RentenblickData } from "../rentenblick-form";

interface ConclusionStepProps {
  data: RentenblickData;
  updateData: (data: Partial<RentenblickData>) => void;
  isConfirmed: boolean;
}

export function ConclusionStep({ data, updateData, isConfirmed }: ConclusionStepProps) {
  return (
    <div className={`space-y-8 ${isConfirmed ? "opacity-60 pointer-events-none" : ""}`}>
      <div className="space-y-3">
        <Label htmlFor="finalNotes" className="text-sm font-semibold text-gray-700">
          Letzte Anmerkungen
        </Label>
        <Textarea
          id="finalNotes"
          value={data.finalNotes}
          onChange={(e) => updateData({ finalNotes: e.target.value })}
          placeholder=""
          className="min-h-32 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          disabled={isConfirmed}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="date" className="text-sm font-semibold text-gray-700">
            Datum
          </Label>
          <Input
            id="date"
            value={data.date}
            onChange={(e) => updateData({ date: e.target.value })}
            placeholder="25.05.2025"
            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
            disabled={isConfirmed}
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="location" className="text-sm font-semibold text-gray-700">
            Ort
          </Label>
          <Input
            id="location"
            value={data.location}
            onChange={(e) => updateData({ location: e.target.value })}
            placeholder=""
            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
            disabled={isConfirmed}
          />
        </div>
      </div>

      {isConfirmed && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-800 font-medium">
              Abschluss bestätigt - Bereit für PDF-Generierung
            </span>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">📋</div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Formular abgeschlossen</h3>
            <p className="text-sm text-blue-800 leading-relaxed">
              Alle Schritte wurden durchlaufen. Sie können nun das PDF generieren oder noch einmal
              einzelne Schritte bearbeiten, indem Sie die entsprechenden Abschnitte entsperren.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
